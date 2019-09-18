/* eslint-disable max-lines */
(() => {
  // Prevent put initApp twice in case js-agent and extension inject initApp
  if (window.Djaty.initApp) {
    window.Djaty.initApp.handleInitFromApiKeyAttr();
    return;
  }

  /**
   * Save untracked items such as files, console, errors,... t the start of page load.
   * with the aim of keeping this file as minimal as we can.
   */
  /* global XMLHttpRequest, Event, MutationObserver, utils, Node */
  /* ########################################################################## */
  /* ############################# CORE INITAPP ############################### */
  /* ########################################################################## */
  Djaty.initApp = Djaty.initApp || {
    landingURL: window.location.href,
    timeline: [],
    onTrackingCoreCb: null,
    trackers: {},
    isInitiated: false,
    originalMethods: {},

    // array for storing events for submission.
    onSubmitHandlers: [],
    nodeListeners: [],
    extConfig: null,
    initialFormData: [],
    ignoredErrors: [],
    ignoreTimelineItem: null,
    globalCustomData: [],

    /* **************************** Public Methods **************************** */

    /**
    * Initialization this object by initialization all trackers.
    *
    * @param {Object} config
    * @param {Boolean} isAlreadyLoaded
    * @param {Function} afterDjatyJSLoadCb
    * @param isControlledByDjatyExt
    * @return void
    */
    init({ config, afterDjatyJSLoadCb, isAlreadyLoaded = false,
           isControlledByDjatyExt = false }) {
      try {
        // Take reference for original addEventListener and use it for our events.
        // in case DOM already loaded take Create iframe and take addEventListener from it.
        if (document.readyState !== 'loading') {
          const tmpIFrame = document.createElement('iframe');
          tmpIFrame.src = window.location.href;
          document.body.appendChild(tmpIFrame);
          Djaty.utils.setOriginalAddEventListener(tmpIFrame.contentDocument.addEventListener);
          Djaty.utils.setOriginalRemoveEventListener(tmpIFrame.contentDocument.removeEventListener);
          Djaty.logger.init(utils.assign({}, tmpIFrame.contentWindow.console));
          document.body.removeChild(tmpIFrame);
        } else {
          Djaty.utils.setOriginalAddEventListener(Node.prototype.addEventListener);
          Djaty.utils.setOriginalRemoveEventListener(Node.prototype.removeEventListener);
          Djaty.logger.init(utils.assign({}, window.console));
        }

        Djaty.utils.externalMethodHandler.init('djatyInitApp');

        // Notify js-sdk that extension found
        if (!Djaty.initApp.isExtension && isControlledByDjatyExt) {
          Djaty.initApp.isExtension = true;
        }

        // Add listener on DOM LOADED event to load CoreLib and when core
        // response call afterDjatyJSLoadCb (djatyUILoad)
        if (!Djaty.initApp.isInitiated) {
          utils.addEventListenerAndSaveIt([{ nodeListeners: this.nodeListeners,
            node: document,
            eventName: 'DOMContentLoaded',
            cb: () => {
              this._loadCoreLib(afterDjatyJSLoadCb);
            },
          }]);
        }

        // Extension only send this cb so any another callee considered as js-frontend-agent config
        let jsFrontendConfig = Djaty.initApp.jsFrontendConfig;
        if (!isControlledByDjatyExt && !jsFrontendConfig) {
          // Set default value for automatic submission in case extension change it
          if (typeof config.allowAutoSubmission === 'undefined') {
            config.allowAutoSubmission = true;
          }

          jsFrontendConfig = config;
        }

        // Handle init djaty-javascript multiple time
        if (Djaty.initApp.jsFrontendConfig && Djaty.initApp.isInitiated
          && !isControlledByDjatyExt) {
          // eslint-disable-next-line no-console
          console.warn('Init djaty javascript SDK multiple time is ignored, Please unify' +
            ' init in one way, note: setting djaty-api-key attribute consider initialize');
          return;
        }

        let mergedConfig = utils.clone(config);
        // Select configuration depending on it's priority
        if (Djaty.initApp.isInitiated) {
          const tmpConfig = jsFrontendConfig || Djaty.initApp.extConfig || config ||
            Djaty.config;

          mergedConfig = utils.clone(tmpConfig);
        }

        try {
          // Validate on Djaty configuration.
          utils.validate('Configuration', Djaty.constants.configStructure, mergedConfig);
        } catch (validationErr) {
          Djaty.utils.externalMethodHandler.callMethod('djatyExt.showNotification', {
            level: 'warning',
            message: 'Invalid djaty-js-sdk configuration. So, Djaty default configuration is now applied.',
          }, () => { });

          throw validationErr;
        }

        if (jsFrontendConfig) {
          Djaty.initApp.jsFrontendConfig = jsFrontendConfig;
        }

        // Validate on config limits and if exceed use our max limits
        Djaty.initApp._handleConfigLimits(mergedConfig);

        // Fallback to default mode
        Djaty.config.trackingOptions = mergedConfig.mode === 'full' ? utils.clone(Djaty.constants.fullMode) :
          utils.clone(Djaty.constants.defaultMode);

        // Handle removeSecretData if an array of boolean then edit it our config then remove it.
        const removeSecretData = mergedConfig.trackingOptions &&
          mergedConfig.trackingOptions.removeSecretData;

        if (Array.isArray(removeSecretData) || removeSecretData === false) {
          Djaty.config.trackingOptions.removeSecretData = removeSecretData;
        } else if (removeSecretData === true) {
          // Add default secret items when user set `removeSecretData` to `true`
          Djaty.config.trackingOptions.removeSecretData = Djaty.constants.secretItemData;
        }

        if (mergedConfig.trackingOptions) {
          delete mergedConfig.trackingOptions.removeSecretData;
        }

        if (mergedConfig.onBeforeBugSubmission) {
          Djaty.initApp._addBeforeBugSubmissionCb(mergedConfig.onBeforeBugSubmission);
          delete mergedConfig.onBeforeBugSubmission;
        }

        // Handle ignored errors.
        if (mergedConfig.ignoredErrors) {
          Djaty.initApp.ignoredErrors = mergedConfig.ignoredErrors;
          delete mergedConfig.ignoredErrors;
        }

        // Handle timeline items callback.
        if (mergedConfig.ignoreTimelineItem) {
          Djaty.initApp.ignoreTimelineItem = mergedConfig.ignoreTimelineItem;
          delete mergedConfig.ignoreTimelineItem;
        }

        if (mergedConfig.trackingOptions) {
          // Use default values when user enable the trackers that accept (object and boolean).
          Djaty.utils.forOwn(mergedConfig.trackingOptions, (key, option) => {
            const skippedTrueValues = ['ajax', 'exception', 'navigation', 'console'];
            if (option === true && skippedTrueValues.indexOf(key) !== -1) {
              delete mergedConfig.trackingOptions[key];
            }
          });
        }

        Djaty.config = utils.mergeRecursive(Djaty.config, mergedConfig);

        if (!isAlreadyLoaded) {
          // To handle loading core and extUI after loading DOM
          if (document.readyState !== 'loading') {
            this._loadCoreLib(afterDjatyJSLoadCb);
          }
        } else {
          this._loadCoreLib(afterDjatyJSLoadCb);
        }

        if (this.isInitiated) {
          return;
        }

        this.isInitiated = true;
        this.timeline.unshift({
          url: window.location.href,
          ev: {
            type: 'pushstate',
            state: null,
            title: document.title,
          },
          time: Date.now(),
          itemType: Djaty.constants.itemType.navigation,
        });

        // Iterate over trackers
        utils.forOwn(this.trackers, (itemType, tracker) => {
          // Initiate every tracker object
          if (!Djaty.config.trackingOptions[itemType]) {
            return;
          }

          tracker.init(this.onTrackingCb);
        });
      } catch (err) {
        if (err instanceof Djaty.DjatyError) {
          throw err;
        }

        Djaty.logger.error('Catch error in init initApp', err);
      }
    },

    /**
     * Destroy of the InitTrackingApp.
     *
     * @return void
     */
    destroy() {
      if (!this.isInitiated) {
        return;
      }

      Djaty.logger.log('Destroy initApp');
      utils.forOwn(Djaty.initApp.trackers, (itemType, tracker) => {
        tracker.destroy();
      });

      this.nodeListeners.forEach(listen => {
        Djaty.utils.originalRemoveEventListener.call(listen.node, listen.eventName, listen.cb);
      });

      this.timeline = [];
      this.isInitiated = false;
      this.onSubmitHandlers = [];
      this.nodeListeners = [];
      this.afterLoadDjatyCb = null;
    },

    /**
     * Add in front of Array events to onSubmitHandlers
     */
    addInFrontOfSubmitHandler(event) {
      utils.validate('addInFrontOfSubmitHandler', Djaty.constants.onBugSubmitStructure, event);
      this.onSubmitHandlers.unshift(event);
    },
    /**
    * Register new tracker.
    *
    * @param {String} itemType
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
    * Register Core Tracking Callback.
    *
    * @param {Object} coreTrackingCb
    * @return void
    */
    regCoreTrackingCb(coreTrackingCb) {
      Djaty.initApp.onTrackingCoreCb = coreTrackingCb;
    },
    /**
     * Extension configuration higher priority of js-frontend-agent config
     *
     * @param {Object} config
     */
    regExtConfig(config) {
      Djaty.initApp.extConfig = config;
    },

    regAfterLoadDjaty(cb) {
      Djaty.initApp.afterLoadDjatyCb = cb;
    },
    /**
    * A Callback called once tracking new items.
    *
    * @param {Object} item
    * @return {Function | Number}
    */
    onTrackingCb(item) {
      if (Djaty.initApp.onTrackingCoreCb) {
        return Djaty.initApp.onTrackingCoreCb(item);
      }

      if (item.itemType === Djaty.constants.itemType.form) {
        return Djaty.initApp.initialFormData.push(item);
      }

      return Djaty.initApp.timeline.push(item);
    },
    /* ########################################################################## */
    /* ######################## LOAD REST OF DJATY TOOL ######################### */
    /* ########################################################################## */

    // To reduce initialization time, lets load rest of code after a while
    // we don't load it as a script tag to catch error message using (try..catch)
    // not only type error in case (CORS)
    _loadCoreLib(loadAfterCoreLoad) {
      const xhttp = new XMLHttpRequest();
      function onLoadError(err, msg) {
        if (!Djaty.initApp.isInitiated) {
          return;
        }

        Djaty.logger.info('Error in loading djaty core', err, msg);
        const errMsg = msg || 'Refused to connect to Djaty. It is most likely a Content Security' +
          ' Policy (CSP) or a connectivity problem. To solve this issue see <a>FAQ</a>';

        Djaty.logger.error('Can\'t load (Djaty core)', errMsg, err);

        if (!Djaty.initApp.isExtension) {
          Djaty.initApp.destroy();

          return;
        }

        Djaty.utils.externalMethodHandler.callMethod('djatyExt.onLoadFailure', () => {
          Djaty.logger.info('Reset successfully.');
          Djaty.utils.externalMethodHandler.callMethod('djatyExt.notify', errMsg, () => {
            Djaty.logger.info('Extension notification had been sent.');
            Djaty.initApp.destroy();
          });
        });
      }

      xhttp.onerror = onLoadError;

      xhttp.onreadystatechange = () => {
        if (xhttp.readyState !== 4) {
          return;
        }

        if (xhttp.status !== 200) {
          const errMsg = 'Unable to load Djaty as we are maintaining our servers now.' +
            ' Please try again after few minutes.';

          onLoadError(xhttp.response, errMsg);

          return;
        }

        // To prevent adding file twice (In case running extension and adding file manually
        // at the same file).
        const isLoaded = document.querySelector('script[djaty-app]');

        if (loadAfterCoreLoad) {
          loadAfterCoreLoad();
        }

        if (isLoaded) {
          return;
        }

        const codeScript = document.createElement('script');
        codeScript.type = 'text/javascript';
        codeScript.innerHTML = xhttp.responseText;
        codeScript.setAttribute('djaty-app', '');
        codeScript.setAttribute('async', '');
        codeScript.classList.add('djaty-app');
        document.head.appendChild(codeScript);
        if (!loadAfterCoreLoad) {
          Djaty.trackingApp.init();
        }
      };
      try {
        xhttp.open('GET', Djaty.config.cdnPath + Djaty.constants.filesURL, true);
        xhttp.send();
      } catch (err) {
        Djaty.logger.error('Catch CORS error during loading djaty core tracking file', err);
        if (err.message.indexOf('Content Security Policy') !== -1) {
          onLoadError(`${err.name}: Refused to connect to Djaty server to solve this problem see ` +
            `<a href="${Djaty.config.apiUrl}/faq">FAQ</a>`);

          return;
        }

        onLoadError(`${err.name}: ${err.message}`);
      }
    },
    // Attach global nodeListeners for tracker listeners
    _attachInitNodeListenersToOurEvents(addEventListenerArgs) {
      addEventListenerArgs.forEach((arg, idx) => {
        addEventListenerArgs[idx].nodeListeners = Djaty.initApp.nodeListeners;
      });
      utils.addEventListenerAndSaveIt(addEventListenerArgs);
    },

    /**
     * Check for djaty api key attribute if found init with it
     */
    handleInitFromApiKeyAttr() {
      const djatyApiKey = document.querySelector('script[djaty-api-key]');
      if (djatyApiKey) {
        Djaty.init({
          apiKey: djatyApiKey.getAttribute('djaty-api-key'),
        });
      }
    },

    /**
     * Validate on config limits (timelineLimit, stacktraceLimit) and if exceed use our max limits.
     *
     * @param config
     * @private
     */
    _handleConfigLimits(config) {
      const ourLimits = ['stacktraceLimit', 'timelineLimit'];

      ourLimits.forEach(limit => {
        const maxLimit = Djaty.constants[`${limit}Max`];

        if (!config[limit] || config[limit] < maxLimit) {
          return;
        }

        // eslint-disable-next-line no-console
        console.warn(`You can't exceed limit for ${limit} so we will use our max limit: ` +
          `(${maxLimit})`);

        config[limit] = maxLimit;
      });
    },

    /**
     * Add cb to `onSubmitHandlers` callbacks to run before bug submission on submitted bug
     *
     * @param cb
     * @private
     */
    _addBeforeBugSubmissionCb(cb) {
      utils.validate('beforeBugSubmissionCb', Djaty.constants.onBugSubmitStructure, cb);
      Djaty.initApp.onSubmitHandlers.push(cb);
    },
  };
  /* ########################################################################## */
  /* ############################## Init/Destroy ############################## */
  /* ########################################################################## */
  Djaty.init = config => {
    Djaty.initApp.init({ config });

    if (Djaty.pcApp) {
      Djaty.pcApp.init();
    }

    if (Djaty.trackingApp) {
      Djaty.trackingApp.init({});
    }
  };

  Djaty.trackBug = err => {
    if (!Djaty.initApp.isInitiated) {
      // eslint-disable-next-line no-console
      console.warn('Djaty not initiated, Please initialize Djaty before use this method');

      // eslint-disable-next-line no-console
      console.error(err);

      return;
    }

    if (!(err instanceof Error)) {
      Djaty.initApp.originalMethods.trackConsole.error('Djaty.trackBug accept only Error objects');

      return;
    }

    const time = Date.now();

    const item = {
      err,
      msg: err.message,
      time,
      itemType: Djaty.constants.itemType.exception,
    };

    Djaty.initApp.trackers.exception.onTrackingCb(item);
  };

  Djaty.destroy = destroyMessage => {
    try {
      if (Djaty.initApp.isInitiated) {
        Djaty.initApp.destroy();
      }

      if (Djaty.trackingApp && Djaty.trackingApp.isInitiated) {
        Djaty.trackingApp.destroy();
      }

      if (Djaty.pcApp) {
        Djaty.pcApp.destroy(destroyMessage);
      }
    } catch (err) {
      Djaty.logger.error('Catch djaty.destroy', err);
    }
  };

  /**
   * Set user to send it with patch
   *
   * @param user
   */
  Djaty.setUser = user => {
    if (!Djaty.initApp.isInitiated) {
      // eslint-disable-next-line no-console
      console.warn('Djaty not initiated, Please initialize Djaty before use this method');

      return;
    }

    Djaty.utils.validate('setUser', Djaty.constants.userStructure, user);
    Djaty.config.user = user;
  };

  Djaty.addGlobalCustomData = data => {
    Djaty.initApp.globalCustomData.push(data);
  };

  /* ########################################################################## */
  /* ############################### NAVIGATION ############################### */
  /* ########################################################################## */
  const navigationTracker = {
    onTrackingCb: null,
    isInitiated: false,
    /* **************************** Public Methods **************************** */
    /**
     * Initialization of the tracker.
     *
     * @return void
     */
    init(onTrackingCb) {
      if (this.isInitiated) {
        return;
      }
      this.isInitiated = true;
      this.onTrackingCb = onTrackingCb;
      Djaty.initApp.originalMethods.trackPushStateNavigation = window.history.pushState;
      Djaty.initApp.originalMethods.trackReplaceStateNavigation = window.history.replaceState;
      window.history.pushState = this
        ._wrapMethod(Djaty.initApp.originalMethods.trackPushStateNavigation, 'pushstate');

      window.history.replaceState = this
        ._wrapMethod(Djaty.initApp.originalMethods.trackReplaceStateNavigation, 'replacestate');

      Djaty.initApp._attachInitNodeListenersToOurEvents([
        { node: window, eventName: 'popstate', cb: this._handleNavigation },
      ]);
    },
    /**
     * Destory of the tracker.
     *
     * @return void
     */
    destroy() {
      if (!this.isInitiated) {
        return;
      }

      this.isInitiated = false;
      window.history.pushState = Djaty.initApp.originalMethods.trackPushStateNavigation;
      window.history.replaceState = Djaty.initApp.originalMethods.trackReplaceStateNavigation;
    },
    /* **************************** Private Methods *************************** */
    /**
     *  Method for wrapping pushState/replace Method.
     *
     * @param {Function} originalFn
     * @param {string} type
     * @returns {Function}
     * @private
     */
    _wrapMethod(originalFn, type) {
      return function wrapNav(...args) {
        try {
          const origReturn = originalFn.apply(this, args);
          const data = {
            type,
            state: args[0],
          };

          navigationTracker._handleNavigation(data);
          return origReturn;
        } catch (err) {
          return Djaty.logger.error(`Catch navigator tracker '${type}' wrapper`, err);
        }
      };
    },

    /**
     * Navigation Handler.
     *
     * @param {Object} ev
     * @private
     */
    _handleNavigation(ev) {
      const time = Date.now();
      const item = {
        itemType: Djaty.constants.itemType.navigation,
        ev,
        url: window.location.href,
        time,
      };

      navigationTracker.onTrackingCb(item);
    },
  };

  Djaty.initApp.addTracker(Djaty.constants.itemType.navigation, navigationTracker);
  /* ########################################################################## */
  /* ############################## AJAX CALLS ################################ */
  /* ########################################################################## */
  const ajaxTracker = {
    onTrackingCb: null,
    requestDetails: {},
    isInitiated: false,
    // Keep track of reqId (needed to backend tracking) for every AJAX req.
    // reqMap: [],

    /* **************************** Public Methods **************************** */
    /**
     * Initialization of the tracker.
     *
     * @return void
     */
    init(onTrackingCb) {
      if (this.isInitiated) {
        return;
      }

      this.isInitiated = true;
      this.onTrackingCb = onTrackingCb;
      utils.assign(Djaty.initApp.originalMethods, {
        trackOpenAjax: window.XMLHttpRequest.prototype.open,
        trackSendAjax: window.XMLHttpRequest.prototype.send,
        setHeadWrap: window.XMLHttpRequest.prototype.setRequestHeader,
        abortWrapper: window.XMLHttpRequest.prototype.abort,
      });

      utils.assign(window.XMLHttpRequest.prototype, {
        open: this._wrapReqOpen(window.XMLHttpRequest.prototype.open),
        setRequestHeader: this._wrapSetReqHeader(window.XMLHttpRequest.prototype.setRequestHeader),
        send: this._wrapReqSend(window.XMLHttpRequest.prototype.send),
        abort: this._wrapAbort(window.XMLHttpRequest.prototype.abort),
      });
    },
    /**
     * Destroy of the tracker.
     *
     * @return void
     */
    destroy() {
      if (!this.isInitiated) {
        return;
      }

      utils.assign(window.XMLHttpRequest.prototype, {
        open: window.XMLHttpRequest.prototype.open,
        setRequestHeader: window.XMLHttpRequest.prototype.setRequestHeader,
        send: window.XMLHttpRequest.prototype.send,
        abort: window.XMLHttpRequest.prototype.abort,
      });

      this.isInitiated = false;
    },

    /* **************************** Private Methods *************************** */
    /**
     * Wrap "open" method and listen to all requests being opened.
     * @param  {Function} originalFn
     * @return {Function}
     */
    _wrapReqOpen(originalFn) {
      if (typeof originalFn !== 'function') {
        throw new Error('_wrapReqOpen only accepts \'originalFn\' as a function');
      }

      return function wrapOpen(...args) {
        // here we listen to the same request the 'original' code made
        // before it can listen to it, this guarantees that
        // any response it receives will pass through our modifier
        // function before reaching the 'original' code.
        // Lets add an ID for every Ajax request and set a it as a special header to
        // send to back end and help merging both back and front ends timelines.
        const requestStart = new Date().getTime();
        const host = window.location.host;
        const rand = Math.random() * 10000000;
        const requestId = `${requestStart}${rand}_${host}${Djaty.initApp.isExtension ? '_extension' : ''}`;
        // XMLHttpRequest.prototype.setRequestHeader = (...params) => {
        //   headers.customRequestHeader.push({ name: params[0], value: params[1] });
        //   Djaty.initApp.originalMethods.setHeadWrap.apply(this, ...params);
        // };
        // const reqMap = ajaxTracker.reqMap;
        // reqMap.push({xhr: this, reqId});
        args[1] += args[1].match(/\?/) ? '&' : '?';
        args[1] += `djatyReqId=${requestId}`;
        this.__djaty = {
          openParams: args,
          reqStart: requestStart,
          reqId: requestId,
          requestHeaders: [],
        };

        // here we return everything originalFn might return so nothing breaks
        return originalFn.apply(this, args);
      };
    },
    /**
     * Wrap "setRequestHeader" method and listen to added headers to requests.
     * @param  {Function} originalFn
     * @return {Function}
     */
    _wrapSetReqHeader(originalFn) {
      if (typeof originalFn !== 'function') {
        throw new Error('_wrapReqOpen only accepts \'originalFn\' as a function');
      }

      return function wrapSetReqHeader(...args) {
        const originalReturn = originalFn.apply(this, args);

        // Don't track our requests.
        if (Djaty.initApp.trackers.ajax._isDjatyAjax(this.__djaty.openParams[1],
          this.__djaty.requestHeaders)) {
          return originalReturn;
        }

        try {
          // I try to avoid adding the same header twice.
          const isHeaderAlreadyExists = this.__djaty.requestHeaders
            .find(item => item.name === args[0]);
          if (!isHeaderAlreadyExists) {
            // I stringify the value of header to avoid has different types for it (number, string)
            // Our validation and dashboard expect it as string.
            this.__djaty.requestHeaders.push({ name: args[0], value: JSON.stringify(args[1]) });
          } else {
            isHeaderAlreadyExists.value = JSON.stringify(args[1]);
          }
        } catch (err) {
          Djaty.logger.error('Catch wrapping setRequestHeader method with error ', err);
        }

        return originalReturn;
      };
    },
    /**
     * Wrap "send" method and listen to all requests being sent.
     * @param  {Function} originalFn
     * @return {Function}
     */
    _wrapReqSend(originalFn) {
      if (typeof originalFn !== 'function') {
        throw new Error('_wrapReqOpen only accepts \'originalFn\' as a function');
      }

      const ajaxCookie = document.cookie;

      return function djatyXHRSendWrapper(...args) {
        try {
          // Don't track our requests.
          if (Djaty.initApp.trackers.ajax._isDjatyAjax(this.__djaty.openParams[1],
            this.__djaty.requestHeaders)) {
            return originalFn.apply(this, args);
          }

          ajaxTracker.requestDetails = {
            reqArgs: this.__djaty.openParams,
            isAborted: this.__djaty.isAborted,
            requestPayload: args[0],
            reqId: this.__djaty.reqId,
            ajaxCookie,
            state: 'pending',
            headers: {
              requestHeaders: this.__djaty.requestHeaders,
            },
          };

          ajaxTracker._ajaxHandler.call(this, ajaxTracker.requestDetails);

          Djaty.initApp._attachInitNodeListenersToOurEvents([{
            node: this,
            eventName: 'readystatechange',
            cb: ev => {
              // Check if request finished and response is ready.
              if (this.readyState !== 4) {
                return;
              }

              const resHeaders = this.getAllResponseHeaders();
              const reqEnd = Date.now();
              const requestTime = reqEnd - this.__djaty.reqStart;
              ajaxTracker.requestDetails = { ev,
                reqArgs: this.__djaty.openParams,
                isAborted: this.__djaty.isAborted,
                reqId: this.__djaty.reqId,
                requestTime,
                state: 'finished',
                headers: {
                  responseHeaders: resHeaders,
                  requestHeaders: this.__djaty.requestHeaders,
                },
              };

              ajaxTracker._ajaxHandler.call(this, ajaxTracker.requestDetails);
            } }]);
        } catch (err) {
          Djaty.logger.error('Catch Ajax tracker error message ', err);
        }

        // here we return everything originalFn might return so nothing breaks
        return originalFn.apply(this, args);
      };
    },

    /**
     * Wrap "abort" method and listen to aborted requests.
     * @param  {Function} originalFn
     * @return {Function}
     */
    _wrapAbort(originalFn) {
      if (typeof originalFn !== 'function') {
        throw new Error('_wrapAbort only accepts \'originalFn\' as a function');
      }

      return function wrapAbort(...args) {
        this.__djaty.isAborted = true;
        return originalFn.apply(this, args);
      };
    },
    /**
    * Event Handler
    * @param  {Event} ev
    * @param  {Array} reqArgs
    * @param  {Boolean} isAborted
    * @param  {Array} requestPayload
    * @param  {String} reqId
    * @param  {String} state
    * @param  {Number} requestTime
    * @param  {String} ajaxCookie
    * @param  {Object} headers
    * @return {void}
    */
    _ajaxHandler({ ev, reqArgs, isAborted, requestPayload, reqId, state,
      requestTime, ajaxCookie, headers }) {
      if (!(ev instanceof Event && ev.type === 'readystatechange') && state !== 'pending') {
        throw new Error('_ajaxHandler only accept events of type \'readystatechange\'');
      }

      if (!Array.isArray(reqArgs)) {
        throw new Error('Make sure you pass "reqArgs" parameter as an array');
      }

      const time = Date.now();

      const item = {
        ev,
        reqArgs,
        requestPayload,
        isAborted,
        time,
        requestTime,
        itemType: Djaty.constants.itemType.ajax,
        reqId,
        ajaxCookie,
        headers,
        state,
      };

      ajaxTracker.onTrackingCb(item);
    },

    /**
     * Is Djaty ajax request.
     *
     * @param url
     * @param requestHeaders
     * @returns {*}
     * @private
     */
    _isDjatyAjax(url, requestHeaders) {
      // Don't track our requests.
      const escapedApiURL = `${Djaty.config.bugsURL}${Djaty.config.api}${Djaty.config.apiBugsUrl}`
        .replace(/\//g, '\\/')
        .replace(/\./g, '\\.');

      const escapedCDNURL = Djaty.config.cdnPath
        .replace(/\//g, '\\/')
        .replace(/\./g, '\\.');

      const ignoredURLRegex = new RegExp(`^(${escapedApiURL}|${escapedCDNURL}).*`, 'gi');

      return url.match(ignoredURLRegex) || requestHeaders['current-domain'];
    },
  };

  Djaty.initApp.addTracker(Djaty.constants.itemType.ajax, ajaxTracker);
  /* ########################################################################## */
  /* ############################### CONSOLE ################################## */
  /* ########################################################################## */
  const consoleTracker = {
    onTrackingCb: null,
    isInitiated: false,

    /* **************************** Public Methods **************************** */
    /**
    * Initialization of the tracker.
    *
    * @return void
    */
    init(onTrackingCb) {
      if (this.isInitiated) {
        return;
      }

      this.isInitiated = true;
      this.onTrackingCb = onTrackingCb;
      Djaty.initApp.originalMethods.trackConsole = utils.assign({}, window.console);
      const console = window.console;
      // On pc 'log' is an own property inside console obj but on hybrid mobile
      // it is an inherited property. So, we iterate over console obj with
      // normal for..in to get the prototype chained properties also.

      // // eslint-disable-next-line
      // for (const attrName in console) {
      //   const impl = console[attrName];
      //   if (typeof impl !== 'function') {
      //     continue;
      //   }
      //
      //   console[attrName] = this._wrapMethod(attrName, impl);
      // }
      utils.forOwn(console, (attrName, method) => {
        if (typeof method !== 'function' || (Djaty.config.trackingOptions.console.excludedMethods &&
          Djaty.config.trackingOptions.console.excludedMethods
            .find(item => item === attrName) !== undefined)) {
          return;
        }

        console[attrName] = this._wrapMethod(attrName, method);
      });
      // Window here is identical to the page's window, since this script is injected
      window.console = console;
    },

    /**
     * Destroy console Tracker
     */
    destroy() {
      if (!this.isInitiated) {
        return;
      }

      this.isInitiated = false;
      window.console = Djaty.initApp.originalMethods.trackConsole || window.console;
      // Djaty.initApp.originalMethods.trackConsole = null;
    },

    /* **************************** Private Methods *************************** */
    /**
     * Wrap "console" methods.
     *
     * @param  {String} attrName
     * @param  {Function} originalFn
     * @return {Function}
     */
    _wrapMethod(attrName, originalFn) {
      if (typeof attrName !== 'string') {
        throw new Error('Make sure you pass "attrName" parameter as a string');
      }

      if (typeof originalFn !== 'function') {
        throw new Error('_wrapMethod only accepts \'originalFn\' as a function');
      }

      return function wrappedConsole(...args) {
        // Add try/catch her to handle exception when user call console methods because console
        // tracker not wrapped with our try/catch.
        try {
          const originalReturn = originalFn.apply(this, args);

          consoleTracker._consoleHandler(attrName, args);
          return originalReturn;
        } catch (err) {
          return Djaty.logger.error('Catch console error', err);
        }
      };
    },

    /**
     * Log wrapping Handler
     * @param  {String} attrName
     * @param  {Array} args
     * @param  {Number} time
     * @return {void}
     */
    _consoleHandler(attrName, args, time = Date.now()) {
      if (typeof attrName !== 'string') {
        throw new Error('Make sure you pass "attrName" parameter as a string');
      }

      if (!Array.isArray(args)) {
        throw new Error('Make sure you pass "args" parameter as an array');
      }

      // Allow debugging our code without being tracked.
      if (args[0] === 'Djaty') {
        return args.splice(0, 1);
      }

      const item = {
        attrName,
        args,
        time,
        itemType: Djaty.constants.itemType.console,
      };

      return this.onTrackingCb(item);
    },
  };

  Djaty.initApp.addTracker(Djaty.constants.itemType.console, consoleTracker);

  /* ########################################################################## */
  /* ################################ ERRORS ################################## */
  /* ########################################################################## */
  const exceptionTracker = {
    onTrackingCb: null,
    isInitiated: false,
    /* **************************** Public Methods **************************** */
    /**
     * Initialization of the tracker.
     *
     * @return void
     */
    init(onTrackingCb) {
      if (this.isInitiated) {
        return;
      }

      this.isInitiated = true;
      this.onTrackingCb = onTrackingCb;

      Djaty.initApp._attachInitNodeListenersToOurEvents([{
        node: window,
        eventName: 'error',
        cb: exceptionTracker._errHandler,
      }]);
    },
    /**
     * Destroy of the tracker.
     *
     * @return void
     */
    destroy() {
      if (!this.isInitiated) {
        return;
      }

      this.isInitiated = false;
    },
    /* **************************** Private Methods *************************** */
    /**
    * Error event Handler
    *
    * @param  {Event} ev
    * @return {void}
    */
    _errHandler(ev) {
      if (!(ev instanceof Event && ev.type === 'error')) {
        throw new Error('_errHandler only accept events of type \'error\'');
      }

      const time = Date.now();

      const item = {
        err: ev.error,
        msg: ev.message,
        time,
        itemType: Djaty.constants.itemType.exception,
      };

      exceptionTracker.onTrackingCb(item);
    },
  };

  Djaty.initApp.addTracker(Djaty.constants.itemType.exception, exceptionTracker);

  /* ########################################################################## */
  /* ################################# FILES ################################## */
  /* ########################################################################## */
  const fileTracker = {
    onTrackingCb: null,

    /* **************************** Public Methods **************************** */
    /**
    * Initialization of the tracker.
    *
    * @return void
    */
    init(onTrackingCb) {
      this.onTrackingCb = onTrackingCb;

      // Commented types below to indicate that we tried to handle but couldn't find
      // a way to handle them.
      const fileTypes = {
        // frame: {target: 'src'},
        // iframe: {target: 'src'},
        img: { target: 'src' },
        input: { target: 'src' },
        link: { target: 'href' },
        // object: {target: 'data'},
        script: { target: 'src' },
        audio: { target: 'src' },
        video: { target: 'src' },
        // embed: {target: 'src'},
        source: { target: 'src' },
        track: { target: 'src' },
      };

      const fileTypesNames = Object.keys(fileTypes);
      const observerConfig = {
        // Listening to Dom additions.
        childList: true,

        // Recursive listening.
        subtree: true,
      };

      function addNodeListener(nodeEl, type) {
        function eventCb() {
          Djaty.initApp.trackers.file._fileHandler(nodeEl, type.target, 'error');
        }

        Djaty.initApp._attachInitNodeListenersToOurEvents([{
          node: nodeEl,
          eventName: 'error',
          cb: eventCb,
        }]);
      }

      function nodeElCheck(parentNodeEl) {
        if (!utils.isDomElement(parentNodeEl)) {
          return;
        }

        const nestedChildrenEls = utils.nodeListToArr(parentNodeEl.querySelectorAll(fileTypesNames.join(', ')));
        nestedChildrenEls.push(parentNodeEl);
        nestedChildrenEls.forEach(nodeEl => {
          const tagName = nodeEl.nodeName.toLowerCase();
          const type = fileTypes[tagName];

          // if not an intent node type or has djaty-app
          // attr(to exclude current script from the process)
          // and if doesn't have a scr/href
          if (!(type && nodeEl[type.target] && !nodeEl.hasAttribute('djaty-app') &&
            !nodeEl.hasAttribute('__djaty_file_already_tracked'))) {
            return;
          }

          addNodeListener(nodeEl, type);
        });
      }

      const allDOMElement = document.querySelectorAll(fileTypesNames.join(', '));
      utils.nodeListToArr(allDOMElement).forEach(nodeEl => {
        addNodeListener(nodeEl);
      });

      // Listening to every DOM element when added.
      Djaty.initApp.originalMethods.trackFiles = new MutationObserver(mutations => {
        try {
          mutations.forEach(mutation => {
            utils.nodeListToArr(mutation.addedNodes).forEach(nodeEl => {
              nodeElCheck(nodeEl);
            });
          });
        } catch (err) {
          Djaty.logger.error('Catch in mutations observer', err);
        }
      });

      Djaty.initApp.originalMethods.trackFiles.observe(document, observerConfig);
    },
    /**
     * Destory file tracker
     */
    destroy() {
      if (Djaty.initApp.originalMethods.trackFiles) {
        Djaty.initApp.originalMethods.trackFiles.disconnect();
      }
    },
    /* **************************** Private Methods *************************** */
    /**
     * Error event Handler
     *
     * @param  {Object} node
     * @param  {Object} target
     * @param  {String} ev
     * @return {void}
     */
    _fileHandler(node, target, ev) {
      if (typeof target !== 'string' || typeof ev !== 'string') {
        throw new Error('Make sure you pass "_fileHandler" parameters correctly');
      }

      if (!utils.isDomElement(node)) {
        throw new Error('Make sure you pass "node" parameter as DOM element');
      }

      if (node.hasAttribute('__djaty_file_already_tracked')) {
        return;
      }

      node.setAttribute('__djaty_file_already_tracked', '');

      const time = Date.now();

      const item = {
        node,
        target,
        ev,
        time,
        itemType: Djaty.constants.itemType.file,
      };

      this.onTrackingCb(item);
    },
  };

  Djaty.initApp.addTracker(Djaty.constants.itemType.file, fileTracker);

  /* ########################################################################## */
  /* ################################ FORMS ################################### */
  /* ########################################################################## */
  const formTracker = {
    onTrackingCb: null,
    isInitiated: false,

    /* **************************** Public Methods **************************** */
    /**
    * Initialization of the tracker.
    *
    * @return void
    */
    init(onTrackingCb) {
      if (this.isInitiated) {
        return;
      }
      this.isInitiated = true;
      this.onTrackingCb = onTrackingCb;
      const formObserverConfig = {
        // Listening to Dom additions.
        childList: true,

        // Recursive listening.
        subtree: true,
      };
      function formElCheck(node) {
        const form = node;
        const tagName = node.nodeName.toLowerCase();
        const untracked = node.className && node.className.match
          && node.className.match('djaty-no-track');
        if (untracked) {
          return;
        }

        if (tagName !== 'form') {
          node.childNodes.forEach(child => {
            formElCheck(child);
          });

          return;
        }

        Djaty.initApp._attachInitNodeListenersToOurEvents([{
          node: form,
          eventName: 'submit',
          cb: formTracker._onFormSubmit,
        }]);
      }
      const allFormEls = document.querySelectorAll('form');
      utils.nodeListToArr(allFormEls).forEach(node => {
        formElCheck(node);
      });

      Djaty.initApp.originalMethods.trackForm = new MutationObserver(mutations => {
        try {
          mutations.forEach(mutation => {
            utils.nodeListToArr(mutation.addedNodes).forEach(node => {
              formElCheck(node);
            });
          });
        } catch (err) {
          Djaty.logger.error('Catch in mutations observer', err);
        }
      });

      Djaty.initApp.originalMethods.trackForm.observe(document, formObserverConfig);
    },
    /**
     * Destory Form tracker
     */
    destroy() {
      if (!this.isInitiated) {
        return;
      }
      this.isInitiated = false;
      if (Djaty.initApp.originalMethods.trackForm) {
        Djaty.initApp.originalMethods.trackForm.disconnect();
      }
    },
    /* **************************** Private Methods *************************** */
    /**
    * On form submit event handler.
    *
    * @param {Event} ev
    * @return void
    */
    _onFormSubmit(ev) {
      if (!(ev instanceof Event && ev.type === 'submit')) {
        throw new Error('_onFormSubmit only accept events of type \'submit\'');
      }

      const time = Date.now();

      const item = {
        ev,
        time,
        itemType: Djaty.constants.itemType.form,
      };

      formTracker.onTrackingCb(item);
    },
  };

  Djaty.initApp.addTracker(Djaty.constants.itemType.form, formTracker);

  /**
   * Adding events to onSubmitHandlers
   */
  Djaty.addSubmitHandler = cb => {
    if (!Djaty.initApp.isInitiated) {
      // eslint-disable-next-line no-console
      console.warn('Djaty not initiated, Please initialize Djaty before use this method');

      return;
    }

    Djaty.initApp._addBeforeBugSubmissionCb(cb);
  };

  Djaty.version = '1.0.0';

  Djaty.initApp.handleInitFromApiKeyAttr();
})();
