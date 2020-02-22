(() => {
  /**
   * Djaty Tracking Parent App Singleton Object.
   *
   * This object help building the tracking process in terms of modules. Every module/component
   * registers itself and this object control and manage them.
   *
   * This file is combined with other tracking files using 'gulp' then the generated
   * file will be injected by the extension or manually by including the file.
   */

  /* global LocalStorageWrapper, browserData , throttle, autoReport */

  Djaty.trackingApp = {
    trackers: {},

    // localStorage similar to database connections.
    localStorage: null,
    isInitiated: false,
    agentId: 'jsFrontendAgent',
    agentVersion: '1.0.0',
    throttleModule: null,
    submitterCb: null,
    /* ######################################################################## */
    /* ############################# PUBLIC METHODS ########################### */
    /* ######################################################################## */

    /** *************************** Initializing Obj ************************** */
    /**
     * Initialization this object by initialization all components.
     *
     * @return void
     */
    init() {
      // Prevent calling Djaty.init() twice and don't init trackingApp if initApp not initialized.
      if (this.isInitiated || !Djaty.initApp.isInitiated) {
        return;
      }

      this.isInitiated = true;

      // Prevent initialization without registering the storage.
      if (!this.localStorage || !this.memoryStorage) {
        throw new Error('Please register Djaty Storage first');
      }

      try {
        Djaty.logger.info('Init trackingApp');
        Djaty.utils.djatySetTimeout = Djaty.utils.getTryCatchHandler('setTimeout', window);
        Djaty.utils.djatyAjax = Djaty.utils.getTryCatchHandler('_ajax', Djaty.utils);
        const initApp = Djaty.initApp;

        initApp.addInFrontOfSubmitHandler(this._filterSecret);

        // initialize throttle module and save it to tracking app.
        if (!throttle.isInitialized) {
          const agentConstData = this.getAgentConstData();
          Djaty.utils.forOwn(Djaty.config, (propName, prop) => {
            if (propName === 'tags' && prop.length > 0 || propName === 'stage' && prop.length > 0) {
              agentConstData[propName] = prop;
            }
          });

          this.throttleModule = throttle.init(agentConstData);
        }

        // initialize auto report module and save it to trackingApp.
        if (!autoReport.isInitiated) {
          const agentConstData = this.getAgentConstData();
          delete agentConstData.release;

          const usedTrackerInAutoReport = ['console', 'exception']
            .map(tracker => this.trackers[tracker].timelineFormatter.bind(this.trackers[tracker]));

          this.autoReportModule = autoReport.init(agentConstData, ...usedTrackerInAutoReport);
        }

        // Iterate over trackers
        Djaty.utils.forOwn(this.trackers, (itemType, tracker) => {
          // Get initial tracker and send it to the tracker.
          const localStorageWrapper = new LocalStorageWrapper(itemType, this.localStorage);

          // Initiate every tracker object
          tracker.init(localStorageWrapper);
        });


        // Destroy disabled trackers.
        Djaty.utils.forOwn(Djaty.constants.itemType, (itemKey, itemValue) => {
          if (!Djaty.config.trackingOptions[itemValue]) {
            initApp.trackers[itemValue].destroy();
          }
        });

        // Format initialFormData
        Djaty.initApp.initialFormData.forEach(formItem => {
          Djaty.trackingApp.trackers.form.timelineFormatter(formItem);
        });

        Djaty.initApp.initialFormData = [];

        Djaty.trackingApp._formatInitAppTimelineItems(0);
      } catch (err) {
        Djaty.logger.error('Catch Init trackingApp with error', err);
      }
    },

    /**
     * Destroy this object by destroy all components.
     *
     * @return void
     */
    // eslint-disable-next-line no-unused-vars
    destroy() {
      Djaty.logger.info('Destroy trackingApp');
      if (!this.isInitiated) {
        return;
      }

      this.isInitiated = false;
      this.throttleModule.destroy();
      this.autoReportModule.destroy();
      this.timeline = Djaty.initApp.timeline;
    },

    /**
     * Format initApp timeline items
     *
     * @param length
     * @private
     */
    _formatInitAppTimelineItems(length) {
      try {
        if (length >= Djaty.initApp.timeline.length) {
          Djaty.initApp.regCoreTrackingCb(Djaty.trackingApp._onTrackingCb);
          if (Djaty.initApp.timeline.length < Djaty.config.timelineLimit) {
            return;
          }

          Djaty.initApp.timeline.splice(0, length - Djaty.config.timelineLimit + 1);
          Djaty.initApp.timeline.unshift({ itemType: 'trimming' });

          return;
        }

        // Remove un-tracked items
        if (!Djaty.config.trackingOptions[Djaty.initApp.timeline[length].itemType]) {
          Djaty.initApp.timeline.splice(length, 1);
          Djaty.trackingApp._formatInitAppTimelineItems(length);

          return;
        }

        const item = Djaty.initApp.timeline[length];

        // To avoid using unloaded trackers in old versions.
        if (!Djaty.trackingApp.trackers[item.itemType]) {
          const itemIndex = Djaty.initApp.timeline.indexOf(item);

          Djaty.initApp.timeline.splice(itemIndex, 1);
          Djaty.trackingApp._formatInitAppTimelineItems(itemIndex);

          return;
        }

        // We have two type of items:
        // - Normal items: We get all details of the timeline item only once.
        // - Pending items: They have 2 states (pending, finished):
        //   - State Pending: The timeline item has initial data which is still valid for
        //                    submission. We store a timeline snapshot inside the tracker to be used
        //                    if the item becomes Finished with an error.
        //   - State Finished: The timeline item is now filled with all data. If it's an error,
        //                     we use the timeline snapshot array instead of the main one.
        //                     (To send the actual activities at the item created not when
        //                     being finished to avoid taking later items with the bug submission)
        Djaty.trackingApp.trackers[item.itemType].timelineFormatter(item,
          ({ formattedObj, type, isIgnored, state }) => {
            let itemIndex = Djaty.initApp.timeline.indexOf(item);

            if (isIgnored) {
              Djaty.initApp.timeline.splice(itemIndex, 1);
              Djaty.trackingApp._formatInitAppTimelineItems(itemIndex);

              return;
            }

            // I merge the typical items into one item with increasing the `repetitionCount`
            // by one and remove the new one
            // I check for:
            // - length to avoid do this condition on first item in timeline
            // - `Djaty.initApp.timeline[length - 1].hash` and
            //   `Djaty.initApp.timeline[length - 1].repetitionCount` it's a bug
            //    or something can counted (like console)
            // - `formattedObj.hash === Djaty.initApp.timeline[length - 1].hash` current item is
            //   the same with previous one
            if (length && Djaty.initApp.timeline[length - 1].hash &&
              Djaty.initApp.timeline[length - 1].repetitionCount &&
              formattedObj.hash === Djaty.initApp.timeline[length - 1].hash) {
              Djaty.initApp.timeline.splice(itemIndex, 1);
              --itemIndex;
              --length;
              Djaty.initApp.timeline[length].repetitionCount++;
              Djaty.initApp.timeline[length] = Djaty.utils
                .assign({}, Djaty.initApp.timeline[length]);
            }

            // For initial tracking (before formatting initial timeline items), the `Pending` items
            // will be added to timeline twice and we edit first item and remove duplicate one.
            if (Djaty.trackingApp.trackers[item.itemType].getErrorData && state === 'finished') {
              // Remove new duplicate item
              Djaty.initApp.timeline.splice(itemIndex, 1);
              if (type !== 'error') {
                Djaty.trackingApp._formatInitAppTimelineItems(itemIndex);

                return;
              }

              const errorData = Djaty.trackingApp.trackers[item.itemType].getErrorData(item.reqId);

              Djaty.trackingApp._handleSendingData(errorData);
              Djaty.trackingApp._formatInitAppTimelineItems(itemIndex);

              return;
            }

            // Edit on timeline item by reference to reflect on any clone from timeline
            // items (like clone of timeline for pending ajax).
            Djaty.utils.forOwn(item, key => {
              if (key === 'itemType') {
                return;
              }

              delete item[key];
            });

            Djaty.utils.assign(item, formattedObj);

            if (type !== 'error') {
              Djaty.trackingApp._formatInitAppTimelineItems(++length);

              return;
            }

            const errorData = Djaty.trackingApp._getErrorDataToIdx(itemIndex);
            Djaty.trackingApp._handleSendingData(errorData);

            Djaty.trackingApp._formatInitAppTimelineItems(++length);
          });
      } catch (err) {
        Djaty.logger.error('Unable to format initial timeline items', err);
      }
    },

    /** *********************** Tracker Registration *************************** */
    /**
     * Register new tracker.
     *
     * @param {Object} itemType
     * @param {Object} tracker
     * @return void
     */
    addTracker(itemType, tracker) {
      // Prevent any tracker from registering itself twice.
      if (this.trackers[itemType]) {
        return;
      }

      this.trackers[itemType] = tracker;
    },

    /**
     * Check if timeline item is ignored or not
     *
     * @param {object} error
     * @param {string} itemType
     */
    isTimelineIgnored(error, itemType) {
      if (!Djaty.initApp.ignoreTimelineItem) {
        return false;
      }

      const clonedFormattedItem = Djaty.utils.assign({}, error, { itemType });

      const utils = {
        console: Djaty.initApp.originalMethods.trackConsole,
      };

      try {
        return Djaty.initApp.ignoreTimelineItem(clonedFormattedItem, utils);
      } catch (err) {
        utils.console.error('Unable to ignore the timeline item. Please check ' +
          '`config.ignoreTimelineItem()` option to be implemented properly.', clonedFormattedItem, err);

        return false;
      }
    },

    /**
     * Check if error is ignored or not
     *
     * @param {String} error
     */
    isIgnoredError(error) {
      return Djaty.initApp.ignoredErrors.some(ignoredError => error.indexOf(ignoredError) !== -1);
    },
    /** ************************** Storage Registration ************************ */
    /**
     * Register memory Storage.
     *
     * @param {Object} storage
     * @return void
     */
    registerMemoryStorage(storage) {
      // Prevent memory storage from registering itself twice.
      if (this.memoryStorage) {
        return;
      }

      this.memoryStorage = storage;
    },

    /**
     * Register local Storage.
     *
     * @param {Object} storage
     * @return void
     */
    registerLocalStorage(storage) {
      // Prevent localStorage from registering itself twice.
      if (this.localStorage) {
        return;
      }

      this.localStorage = storage;
    },
    /**
     * Register Submitter Cb.
     *
     * @param {Function} cb
     */
    regOnSubmitCb(cb) {
      this.submitterCb = cb;
    },
    /**
     * Set namespace in configuration
     *
     * @param ns
     */
    setNamespace(ns) {
      const structure = {
        types: ['string'],
        required: true,
        constrains: {
          maxLength: 50,
          minLength: 4,
        },
      };

      Djaty.utils.validate('setNamespace', structure, ns);
      Djaty.config.namespace = ns;
    },

    /**
     * Get config namespace
     *
     * @return {*}
     */
    getNamespace() {
      return Djaty.config.namespace;
    },
    /**
     * Set apiKey in configuration
     *
     * @param apiKey
     */
    setAPIKey(apiKey) {
      const structure = {
        types: ['string'],
        required: true,
        constrains: {
          maxLength: 255,
          minLength: 6,
        },
      };

      Djaty.utils.validate('setApiKey', structure, apiKey);
      Djaty.config.apiKey = apiKey;
    },
    getAllowAutoSubmissionState() {
      return Djaty.config.allowAutoSubmission;
    },
    setAllowAutoSubmissionState(state) {
      const structure = {
        types: ['boolean'],
        required: true,
      };

      Djaty.utils.validate('setAllowAutoSubmission', structure, state);
      Djaty.config.allowAutoSubmission = state;
    },
    /**
     * Set extension state
     *
     * @param state
     */
    setExtensionState(state) {
      const structure = {
        types: ['boolean'],
        required: true,
      };

      Djaty.utils.validate('setExtensionState', structure, state);
      Djaty.initApp.isExtension = state;
    },
    getJSFrontendAgentConfig() {
      return Djaty.initApp.jsFrontendConfig;
    },
    /**
     * Allow user to add any custom data.
     *
     * @return {object}
     */
    getTrackingData() {
      if (!this.localStorage || !this.memoryStorage) {
        throw new Error('Please init() Djaty first');
      }

      const data = {};
      const browserLocalData = browserData.getData();
      // To check if localStorage, sessionStorage, cookies should be tracked
      Djaty.utils.forOwn(browserLocalData, (propName, propValue) => {
        if (!Djaty.config.trackingOptions[propName]) {
          return;
        }

        data[propName] = propValue;
        if (typeof propValue !== 'object') {
          return;
        }

        // To check length of properties of (localStorage, ...) to replace when exceed
        Djaty.utils.forOwn(data[propName], (propKey, value) => {
          if (value.length > Djaty.constants.requestSizeLimit) {
            data[propName][propKey] = `Size of ${propKey} of ${propName} is too long`;
          }
        });
      });

      // Djaty.utils.assign(data, browserData.getData());
      if (typeof data.cookies === 'string') {
        data.cookies = Djaty.utils.convertStrToPair(data.cookies, ';', '=');
      }

      data.user = Djaty.trackingApp._getUser();

      // Load all tracked data.
      const form = Djaty.config.trackingOptions.form === false ?
          this.localStorage.remove('form') : this.localStorage.getData('form') || {};

      const timelineData = { timeline: Djaty.initApp.timeline };


      // Load user data from Djaty initial tracking object
      Djaty.utils.assign(data, { curUrl: window.location.href }, { form },

        // To avoid passing the reference of globalCustomData during sending,
        // Sending exact globalCustomData items for each bug report.
        timelineData, { customData: Djaty.initApp.globalCustomData.slice() });

      return data;
    },

    /**
     * Get user agent data includes: browser, cpu, device, engine and os details.
     * and agentID and agentVersion
     *
     * @return {object}
     */
    getAgentConstData() {
      const constData = {
        agentId: this.agentId,
        agentVersion: this.agentVersion,
        userAgent: Djaty.libs.UAParser(),
        screen: {
          colorDepth: window.screen.colorDepth,
          screenSize: `${window.innerWidth} x ${window.innerHeight}`,
        },
        hashType: Djaty.constants.hashType,
      };

      if (Djaty.config.release) {
        constData.release = Djaty.config.release;
      }

      return constData;
    },
    /**
     * Get agent data that filtered by user's filters 'onSubmitHandlers'.
     *
     * @return {object}
     */
    getFilteredData(data, cb) {
      Djaty.utils.asyncLoop(Djaty.initApp.onSubmitHandlers, [data],
        Djaty.trackingApp.throttleModule, cb);
    },

    /** ************************ Accept User Custom Data *********************** */
    /**
     * Allow user to add any custom data.
     * This function overrides the the added one of Djaty.initApp as we here
     * make a new Djaty object that will lack to that fn if missed.
     *
     * @param {Object} data
     * @param {Function} cb
     * @return void
     */
    addCustomData(data, cb) {
      if (typeof cb !== 'function') {
        throw new Error('Make sure you pass "Djaty.addCustomData" parameter as a function');
      }

      data.customData.push(cb());
    },

    /* ######################################################################## */
    /* ############################ PRIVATE METHODS ########################### */
    /* ######################################################################## */
    /**
     * Handle insert new items to timeline or increment last counter
     *
     * @param item
     * @param formattedObj
     * @returns {number}
     * @private
     */
    _handleInsertItemIntoTimeline(item, formattedObj) {
      const app = Djaty.initApp;
      const lastItem = app.timeline[app.timeline.length - 1];
      const isLastItem = lastItem && lastItem.repetitionCount &&
        (lastItem.hash === formattedObj.hash);

      formattedObj.itemType = item.itemType;

      let itemIndex = app.timeline.indexOf(item);
      if (itemIndex === -1 && !isLastItem) {
        if (app.timeline.length >= Djaty.config.timelineLimit) {
          if (app.timeline[0].itemType === Djaty.constants.trimmingItemType) {
            app.timeline.splice(1, 1);
          } else {
            app.timeline.shift();
            app.timeline.unshift({ itemType: Djaty.constants.trimmingItemType });
          }
        }

        // Update on item by reference to reflect on any snapshot from this item.
        Djaty.utils.forOwn(item, key => {
          if (key === 'itemType') {
            return;
          }

          delete item[key];
        });

        Djaty.utils.assign(item, formattedObj);

        app.timeline.push(item);
        itemIndex = app.timeline.indexOf(item);
      } else if (itemIndex === -1 && isLastItem) {
        // Handle new occ. for last item
        lastItem.repetitionCount++;
        itemIndex = app.timeline.length - 1;
        Djaty.initApp.timeline[itemIndex] = Djaty.utils
          .assign({}, Djaty.initApp.timeline[itemIndex]);
      }

      return itemIndex;
    },

    /**
     * Get timeline data from timeline array to specific index
     *
     * @param {Number} itemIndex
     * @returns {Object}
     * @private
     */
    _getErrorDataToIdx(itemIndex) {
      const currentData = Djaty.trackingApp.getTrackingData();
      currentData.timeline = Djaty.initApp.timeline.slice(0, itemIndex + 1);

      return currentData;
    },
    /**
     * Filter error timeline data and handle long/short title for last item and send data to
     * throttle manager or external listener
     *
     * @param currentData
     */
    _handleSendingData(currentData) {
      let filteredData = {};
      const djatyBugReport = {
        rawData: currentData,
        addCustomDataCb: dataCb => {
          Djaty.trackingApp.addCustomData(currentData, dataCb);
        },
      };

      const app = Djaty.trackingApp;
      const lastItemIndex = currentData.timeline.length - 1;
      const lastTimelineItem = currentData.timeline[lastItemIndex];

      currentData.hash = lastTimelineItem.hash;
      currentData.longTitle = lastTimelineItem.longTitle;

      if (lastTimelineItem.shortTitle) {
        currentData.shortTitle = lastTimelineItem.shortTitle;
        app.lastBugShortTitle = lastTimelineItem.shortTitle;
        delete lastTimelineItem.shortTitle;
      } else {
        currentData.shortTitle = app.lastBugShortTitle;
      }

      currentData.bugType = lastTimelineItem.itemType;

      app.getFilteredData(djatyBugReport, data => {
        filteredData = data.rawData;
        if (!filteredData.customData.length) {
          delete filteredData.customData;
        }

        if (app.submitterCb) {
          app.submitterCb.call(app.throttleModule, filteredData);
        }

        if (!Djaty.config.allowAutoSubmission) {
          return;
        }

        app.throttleModule.ManageThrottling.call(app.throttleModule, filteredData);
      });
    },

    /**
     * A Callback called once tracking new items.
     *
     * @param {Object} item
     */
    _onTrackingCb(item) {
      try {
        // Don't format timeline items if not initiated
        if (!Djaty.trackingApp.isInitiated) {
          return;
        }

        const app = Djaty.trackingApp;

        // To avoid using unloaded trackers in old versions.
        if (!app.trackers[item.itemType]) {
          return;
        }

        // We have two type of items:
        // - Normal items: We get all details of the timeline item only once.
        // - Pending items: They have 2 states (pending, finished):
        //   - State Pending: The timeline item has initial data which is still valid for
        //                    submission. We store a timeline snapshot inside the tracker
        //                    to be used if the item becomes Finished with an error.
        //   - State Finished: The timeline item is now filled with all data. If it's an error,
        //                     we use the timeline snapshot array instead of the main one.
        //                     (To send the actual activities at the item created not when
        //                     being finished to avoid taking later items with the bug submission)
        app.trackers[item.itemType].timelineFormatter(item,
          ({ formattedObj, type, isIgnored, state }) => {
            if (isIgnored) {
              return;
            }

            if (app.trackers[item.itemType].getErrorData && state === 'finished') {
              if (type !== 'error') {
                return;
              }

              const errorData = Djaty.trackingApp.trackers[item.itemType].getErrorData(item.reqId);
              Djaty.trackingApp._handleSendingData(errorData);

              return;
            }

            const itemIndex = Djaty.trackingApp._handleInsertItemIntoTimeline(item, formattedObj);
            if (type !== 'error') {
              return;
            }

            const errorData = Djaty.trackingApp._getErrorDataToIdx(itemIndex);
            Djaty.trackingApp._handleSendingData(errorData);
          });
      } catch (err) {
        Djaty.logger.error('Catch error in onTrackingCb', err);
      }
    },

    // Method check if this is equal to target or not
    _find(item, target) {
      return item.toLowerCase().indexOf(target) > -1;
    },

    // Method to loop over secret data items
    _replaceIfFound(cb) {
      Djaty.config.trackingOptions.removeSecretData.forEach(secretItem => {
        cb(secretItem);
      });
    },

    // Method to check if property found in mode option or not.
    _resolveIfFound(options, data, propName, cb) {
      if (!options[propName] || !data) {
        return;
      }

      cb();
    },

    _filterAjax(item) {
      // filter url
      const secretDataStr = Djaty.config.trackingOptions.removeSecretData.join('|');
      const regex = new RegExp(`(${secretDataStr})=([^&]*)`, 'gi');
      item.openParams.url = item.openParams.url.replace(regex, `$1=${Djaty.constants.privacyPlaceHolder}`);

      // ajax cookies
      Djaty.trackingApp._resolveIfFound(Djaty.config.trackingOptions.ajax, item.cookies, 'cookies', () => {
        item.cookies.forEach(cookie => this._replaceIfFound(secretItem => {
          if (this._find(cookie.name, secretItem)) {
            cookie.value = Djaty.constants.privacyPlaceHolder;
          }
        }));
      });

      // ajax headers
      Djaty.trackingApp._resolveIfFound(Djaty.config.trackingOptions.ajax, item.headers, 'headers', () => {
        Djaty.utils.forOwn(item.headers, propName => {
          item.headers[propName].forEach(header => this._replaceIfFound(secretItem => {
            if (this._find(header.name, secretItem)) {
              header.value = Djaty.constants.privacyPlaceHolder;
            }
          }));
        });
      });

      // ajax queryParams
      Djaty.trackingApp._resolveIfFound(Djaty.config.trackingOptions.ajax, item.queryParams, 'queryParams', () => {
        item.queryParams.forEach(queryParam => this._replaceIfFound(secretItem => {
          if (this._find(queryParam.name, secretItem)) {
            queryParam.value = Djaty.constants.privacyPlaceHolder;
          }
        }));
      });

      // ajax payload
      Djaty.trackingApp._resolveIfFound(Djaty.config.trackingOptions.ajax, item.requestPayload, 'requestPayload', () => {
        if (item.requestPayload instanceof window.FormData) {
          const formattedPayload = {};
          // eslint-disable-next-line
          for (const pair of item.requestPayload.entries()) {
            this._replaceIfFound(secretItem => {
              if (this._find(pair[0], secretItem)) {
                item.requestPayload.set(pair[0], Djaty.constants.privacyPlaceHolder);
              }
              formattedPayload[pair[0]] = pair[1];
            });
          }
          item.requestPayload = formattedPayload;
        } else if (item.requestPayload && item.requestPayload.constructor.name === 'Object') {
          Djaty.utils.forOwn(item.requestPayload, propName => {
            this._replaceIfFound(secretItem => {
              if (this._find(propName, secretItem)) {
                item.requestPayload[propName] = Djaty.constants.privacyPlaceHolder;
              }
            });
          });
        }
      });
    },

    _filterSecret(bugReport, next) {
      // Don't filter any secret data from bugReport if `removeSecretData` option is disabled.
      if (!Djaty.config.trackingOptions || !Djaty.config.trackingOptions.removeSecretData) {
        next(bugReport);
        return;
      }

      const trackingApp = Djaty.trackingApp;
      const data = bugReport.rawData;

      // filter cookies
      Djaty.trackingApp._resolveIfFound(Djaty.config.trackingOptions, data.cookies, 'cookies', () => {
        data.cookies.forEach(item => {
          trackingApp._replaceIfFound(secretItem => {
            if (trackingApp._find(item.name, secretItem)) {
              item.value = Djaty.constants.privacyPlaceHolder;
            }
          });
        });
      });

      // filter localStorage
      Djaty.trackingApp._resolveIfFound(Djaty.config.trackingOptions, data.localStorage, 'localStorage', () => {
        Djaty.utils.forOwn(data.localStorage, propName => {
          trackingApp._replaceIfFound(secretItem => {
            if (trackingApp._find(propName, secretItem)) {
              data.localStorage[propName] = Djaty.constants.privacyPlaceHolder;
            }
          });
        });
      });

      // filter sessionStorage
      Djaty.trackingApp._resolveIfFound(Djaty.config.trackingOptions, data.sessionStorage, 'sessionStorage', () => {
        Djaty.utils.forOwn(data.sessionStorage, propName => {
          trackingApp._replaceIfFound(secretItem => {
            if (trackingApp._find(propName, secretItem)) {
              data.sessionStorage[propName] = Djaty.constants.privacyPlaceHolder;
            }
          });
        });
      });

      // filter form
      Djaty.trackingApp._resolveIfFound(Djaty.config.trackingOptions, data.form, 'form', () => {
        Djaty.utils.forOwn(data.form, (propName, propValue) => {
          trackingApp._replaceIfFound(secretItem => {
            propValue.inputs.forEach((input, index) => {
              // Handle multiple select elements
              if (Array.isArray(data.form[propName].inputs[index].values)) {
                propValue.inputs[index].values.forEach((select, selectIdx) => {
                  if (trackingApp._find(select.text, secretItem)) {
                    data.form[propName].inputs[index].values[selectIdx].value =
                        Djaty.constants.privacyPlaceHolder;
                  }
                });

                return;
              }

              if (trackingApp._find(input.name, secretItem) ||
                trackingApp._find(input.type, secretItem)) {
                data.form[propName].inputs[index].value = Djaty.constants.privacyPlaceHolder;
              }
            });
          });
        });
      });

      // timeline items
      // ajax items
      data.timeline.forEach(item => {
        if (item.itemType !== Djaty.constants.itemType.ajax) {
          return;
        }

        Djaty.utils.forOwn(Djaty.config.trackingOptions.ajax, (propName, propValue) => {
          if (!propValue) {
            return;
          }

          trackingApp._filterAjax(item);
        });
      });

      next(bugReport);
    },

    /**
     * Get user
     *
     * @private
     * @return {*}
     */
    _getUser() {
      return Djaty.config.user ? Djaty.utils.assign({}, Djaty.config.user) : undefined;
    },
  };
})();
