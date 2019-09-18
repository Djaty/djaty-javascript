/* eslint-disable max-lines */
/**
* An object to wrap our commonly used functions.
*/

/* global HTMLElement, Event */
const utils = Djaty.utils = Djaty.utils.assign(Djaty.utils, {
  /**
   * Search array of object for matching key values.
   *
   * @param  {Array} arr
   * @param  {String} key
   * @param  {String} value
   * @return {Array}
   */
  find(arr, key, value) {
    // Error Handling
    if (!Array.isArray(arr)) {
      throw new Error('Make sure you pass "find" arr parameter as an aray');
    }

    return arr.filter(obj => (obj[key] === value ? obj : false));
  },

 /**
   * Return an event handler where the scope refer to the current element
   * Also pass to it the class instance it's working on
   * Use this function for all event handlers inside classes.
   *
   * @param  {Object} instance of the current class
   * @param  {Function} handler (Usually, a member method in the class)
   *         This method should accept the class instance as a new parameter
   * @return {Function} A function with a normal 'this' scope
   */
  getEventHandler(instance, handler) {
    // Error Handling
    if (!(instance instanceof Object)) {
      throw new Error('Make sure you pass "getEventHandler" instance parameter as an object');
    }

    if (typeof handler !== 'function') {
      throw new Error('Make sure you pass "getEventHandler" handler parameter as a function');
    }

    return function eventHandler(ev) {
      handler.call(this, ev, instance);
    };
  },

  /**
   * Check if element is a DOM element and throw errors if not.
   *
   * @param  {String} label : Class name
   * @param  {Object} selectorOrEl:
   *         Accepts string selectorOrEl that match only one DOM element or accepts an object.
   * @param  {String} tagName : DOM element with a certain tag name.
   * @param  {HTMLElement} lookup : DOM element to limit the search scope.
   * @return {HTMLElement}
   */
  getElementFromSelectorOrEl(label, selectorOrEl, tagName = null, lookup = document) {
    // Error Handling
    if (typeof label !== 'string') {
      throw new Error('Make sure you pass "getElementFromSelectorOrEl" label parameter as a string');
    }

    if (typeof selectorOrEl === 'string') {
      const elements = lookup.querySelectorAll(selectorOrEl);
      if (!elements.length) {
        throw new Error(`${label} can't find any DOM elements with passed selectorOrEl`);
      }

      if (elements.length > 1) {
        throw new Error(`${label} can't accept more than one DOM element`);
      }

      if (tagName && elements[0].tagName.toLowerCase() !== tagName.toLowerCase()) {
        throw new Error(`${label} current selectorOrEl is not ${tagName}`);
      }

      return elements[0];
    }

    if (utils.isDomElement(selectorOrEl)) {
      if (tagName && selectorOrEl.tagName.toLowerCase() !== tagName.toLowerCase()) {
        throw new Error(`${label} current selectorOrEl is not ${tagName}`);
      }
      return selectorOrEl;
    }

    throw new Error(`${label} expects selectorOrEl parameter to be ` +
    'either "String" or "HTMLElement"');
  },

  /* eslint-disable no-tabs */
  /**
   * Validate class options against an option structure object.
   *
   * Example for the option structure object:
   *   const optStruct = {
   *     option: {
   *       // Required keys
   *       type: 'string',
   *
   *       // Optional keys
   *       allowedValues: ['foo', 'bar'],
   *
   *			// Optional-conditional keys
   *   		childType: 'selectorOrEl' (Valid only with option "type: array")
   *
   *       // Optional keys with default of true
   *       required: false,
   *     },
   *   };
   *
   * @param  {String} label : Class name
   * @param  {Object} optStruct : key/value opt structure
   * @param  {Object} opt
   * @return {void}
   */
  /* eslint-disable no-tabs */

  assertValidOpts(label, optStruct, opt) {
    if (typeof label !== 'string') {
      throw new Error('Make sure you pass "assertValidOpts" label parameter correctly');
    }

    if (!(optStruct instanceof Object)) {
      throw new Error('Make sure you pass "assertValidOpts" optStruct parameter correctly');
    }

    if (!(opt instanceof Object)) {
      throw new Error(`${label} expects opt parameter to be an object`);
    }

    utils.forOwn(optStruct, (attr, curStruct) => {
      const optAttr = opt[attr];
      if (!optAttr) {
        return;
      }


      const allowedValues = curStruct.allowedValues;
      const required = curStruct.required === false ? curStruct.required : true;

      if (required && typeof optAttr === 'undefined') {
        throw new Error(`${label} expects opt parameter to have ${attr} attribute`);
      }


      // Check if object is an custom/plain object and not any built-in object
      // like Arrays, Functions...
      if (curStruct.type === 'object' && curStruct.properties &&
        optAttr.toString() === '[object Object]') {
        utils.assertValidOpts(label, curStruct.properties, optAttr);
      }

      // eslint-disable-next-line valid-typeof
      if ((typeof optAttr !== curStruct.type && curStruct.type !== 'array' &&
          curStruct.type !== 'selectorOrEl') || (curStruct.type === 'array' &&
            !Array.isArray(optAttr))) {
        throw new Error(`${label} expects opt ${attr} to be ${curStruct.type}`);
      }

      if (curStruct.type === 'selectorOrEl') {
        if (!utils.isDomElement(optAttr) && typeof optAttr !== 'string') {
          throw new Error(`${label} expects opt ${attr} to be ${curStruct.type}`);
        }

        if (typeof optAttr === 'string') {
          const elements = document.querySelectorAll(optAttr);
          if (!elements.length) {
            throw new Error(`${label} expects opt ${attr} to be ${curStruct.type}`);
          }
        }
      }

      if (curStruct.type === 'array' && curStruct.childType) {
        optAttr.forEach(child => {
          const optChildsStruct = {};
          optChildsStruct[`${attr} childs`] = { type: curStruct.childType };
          const optChilds = {};
          optChilds[`${attr} childs`] = child;
          utils.assertValidOpts(label, optChildsStruct, optChilds);
        });
      }

      if (allowedValues && allowedValues.indexOf(optAttr) < 0) {
        // check if the value is allowed
        throw new Error(`${label} expects ${attr} value options to be one of ` +
          `"${allowedValues.join(', ')}"`);
      }
    });
  },

  /**
   * Check for adding optional properties or not depending on trackingOptions in config
   *
   * @param {String}  tracker
   * @param {Object}  formattedObj
   * @param {String}  propName
   * @param {Object}  data
   * @param {Object}  trackingOptions
   * @return {boolean}
   */
  resolveProperty(tracker, formattedObj, propName, data, trackingOptions) {
    if (trackingOptions[tracker][propName]) {
      formattedObj[propName] = data;
      return true;
    }

    return false;
  },
  /** ************************ Handling cross-browsers ********************** */
  /**
   * Handle cross-browsers horizontal mouse/touch position.
   *
   * @param   {Event} ev : The event handler obj
   * @param   {String} axis : could be only 'x' or 'y'
   * @return  {Number}
   */
  normalizedPointerPos(ev, axis) {
    // Error Handling
    const ptr = /mousemove|mouseup|mousedown|touchstart|touchend|touchmove/;
    if (!(ev instanceof Event && ptr.test(ev.type))) {
      // Check if ev is an Event object
      throw new Error('"normalizedPointerPos" expects ev parameter to be an Event object');
    }

    if (typeof axis !== 'string' || ['x', 'y'].indexOf(axis) < 0) {
      throw new Error('"normalizedPointerPos" expects axis parameter to be "x" or "y"');
    }

    const axisUC = axis.toUpperCase();
    const normalizedEvent = ev.touches ? ev.touches[0] : ev;

    if (normalizedEvent[`page${axisUC}`]) {
      return normalizedEvent[`page${axisUC}`];
    }

    if (normalizedEvent[`client${axisUC}`]) {
      const scrollStr = `scroll${axisUC === 'X' ? 'Left' : 'Top'}`;
      const docElScroll = document.documentElement[scrollStr];
      const bodyElScroll = document.body[scrollStr];
      const scrollVal = docElScroll || bodyElScroll;

      return normalizedEvent[`client${axisUC}`] + scrollVal;
    }

    return -1;
  },
  /**
   * AsyncLoop loop over array of functions and end of every function call next function of
   * this array and last param last function you want call.
   *
   * Example:
   *
   * let f1 = (a, b, c, nextCb) => {
   *    console.info('f1', a, b, c);
   *    nextCb(++a, ++b, ++c);
   *  }
   * let f2 = (a, b, c, nextCb) => {
   *    console.info('f2', a, b, c);
   *    nextCb(++a, ++b, ++c);
   *  }
   *
   * asyncLoop([f1, f2], [1, 2, 3], window, (a, b, c) => {
   *   console.info('done', a, b, c)
   * })
   *
   * Output:
   * f1 1 2 3
   * f2 2 3 4
   * done 3 4 5
   * @param {Array} funcArr
   * @param {Array} initArgs
   * @param {Object} ctx
   * @param {Function} doneCb
   */
  asyncLoop(funcArr, initArgs, ctx, doneCb) {
    let i = 0;
    function next(...args) {
      if (i === funcArr.length) {
        doneCb.apply(ctx, args);
        return;
      }
      const newArgs = args.concat(next);
      // Note: we increase 'i' before calling the function in case
      // In case the function called the callback synchronously
      funcArr[i++].apply(ctx, newArgs);
    }
    next.apply(ctx, initArgs);
  },
  /**
   * convert string to Array of object pairs of name:value
   *
   * @param {String} str string for splitting
   * @param {String} splitter 'new line or ;'
   * @param {String} op ' = or : '
   * return {Object}
   */
  convertStrToPair(str, splitter, op) {
    if (typeof str !== 'string') {
      return [];
    }

    const keyValueArray = [];
    const strList = str.split(splitter);
    for (let i = 0; i < strList.length; i++) {
      const keyValue = strList[i].split(op);
      if (keyValue.length < 2) {
        continue;
      }

      keyValueArray.push({ name: keyValue[0], value: keyValue[1] });
    }
    return keyValueArray;
  },
/**
  * Savely append elements into Djaty DOM element.
  *
  * @param  {Object} selectorOrEl
  * @return  {void}
  */
  appendIntoOrCreateDjaty(selectorOrEl) {
    const element = this.getElementFromSelectorOrEl('utils.appendIntoDjaty()', selectorOrEl);
    let djatyEl = document.body.querySelector('.djaty');

    if (djatyEl) {
      return djatyEl.appendChild(element);
    }

    djatyEl = document.createElement('div');
    djatyEl.className = 'djaty';
    djatyEl.classList.add('djaty-tool-hidden');
    document.body.appendChild(djatyEl);

    djatyEl.appendChild(element);
    return element;
  },

  someObject(object, cb) {
    if (!(object instanceof Object)) {
      throw new Error('Make sure you pass "someObject" obj parameter as an object');
    }

    if (typeof cb !== 'function') {
      throw new Error('Make sure you pass "someObject" cb parameter as a function');
    }

    const has = Object.prototype.hasOwnProperty;
    const obj = Object(object);

    // eslint-disable-next-line no-restricted-syntax
    for (const x in obj) {
      if (!has.call(obj, x)) {
        continue;
      }

      if (cb(x, obj[x])) {
        return true;
      }
    }

    return false;
  },
  /**
   * Create Ajax.
   *
   * @param {String} method
   * @param {String} reqUrl
   * @param {Object} data
   * @param {Function} cb
   * @returns
   */
  _ajax(method, reqUrl, data, cb) {
    if (typeof cb !== 'function') {
      cb = data;
      data = undefined;
    }
    const xhr = new XMLHttpRequest();
    xhr.open(method, reqUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    // To work with credentials, CORS allow header must not be '*' it must be the original domain
    // which is dynamic in our case and cannot be fixed.
    // xhr.withCredentials = true;
    xhr.onreadystatechange = () => {
      // If request not complete or Initial OPTIONS CORS response received.
      if (xhr.readyState !== 4 || xhr.status === 204) {
        return;
      }
      let responseText = xhr.responseText;
      responseText = responseText && responseText.replace(')]}\',\n', '');
      let response;
      // If errors, time out or if browser prevented the request for any reason
      // (MixedContent for example).
      try {
        response = responseText ? JSON.parse(responseText) : {};
      } catch (err) {
        response = { response: responseText };
      }

      if (xhr.status >= 400 || xhr.status === 0) {
        const err = {};
        // Don't use new Error(response) as response could be an object
        err.response = response;
        err.status = xhr.status;
        cb(err);
        return;
      }
      cb(null, response);
    };

    if (data) {
      xhr.send(data);
      return;
    }

    xhr.send();
  },

  spinner: {
    isSpin: false,
    externalMethodHandler: {},
    nodeListeners: [],
    init(externalMethodHandler) {
      utils.spinner.externalMethodHandler = externalMethodHandler;
    },
    spin(text = null, actions = [], block = false) {
      if (actions && !Array.isArray(actions)) {
        throw new Error('spin expects "actions" parameter to be Array');
      }

      utils.spinner.isSpin = true;
      const body = document.body;
      const djatyEl = body.querySelector('.djaty');
      let spinner = body.querySelector('.spinner-backdrop');
      if (!spinner) {
        const spinnerEl = this._getSpinnerEl();
        spinner = utils.appendIntoOrCreateDjaty(spinnerEl);
      }
      if (actions.length) {
        spinner.classList.add('with-actions');
      } else {
        spinner.classList.remove('with-actions');
      }
      this.spinnerActions = spinner.querySelector('.actions');
      this.spinnerText = spinner.querySelector('.text');

      // Remove whole actions to remove all exist btns with their handlers.
      // Helpful if user called spin twice without calling stopSpin();
      this.spinnerActions.innerHTML = '';

      actions.forEach(action => {
        const btn = document.createElement('button');
        btn.className = `djaty-btn btn-submit ${action.class}`;
        btn.innerText = action.name;

        if (action.info) {
          const infoSpan = document.createElement('span');
          infoSpan.className = 'info';
          infoSpan.innerText = '?';
          infoSpan.title = action.info;
          btn.appendChild(infoSpan);
        }

        Djaty.utils.addEventListenerAndSaveIt([
          { nodeListeners: Djaty.utils.spinner.nodeListeners,
            node: btn,
            eventName: 'click',
            cb: action.handler },
        ]);
        this.spinnerActions.appendChild(btn);
      });

      if (text) {
        this.spinnerText.innerText = `${text}...`;
      }

      if (block) {
        spinner.classList.add('block-spinner');
      } else {
        spinner.classList.remove('block-spinner');
      }

      this.spinnerActions.classList.add('show');
      djatyEl.classList.add('spin');
      utils.spinner.externalMethodHandler.callMethod('djatyExt.disableDjatyIcon', () => {
        Djaty.logger.info('Disable djaty icon during spinning');
      });
    },

    /**
     * Show spinner.
     *
     * @return void
     */
    stopSpin() {
      const djatyEl = document.body.querySelector('.djaty');
      Djaty.utils.spinner.nodeListeners.forEach(listen => {
        Djaty.utils.originalRemoveEventListener.call(listen.node, listen.eventName, listen.cb);
      });
      Djaty.utils.spinner.nodeListeners = [];

      if (!djatyEl.classList.contains('spin')) {
        return;
      }

      utils.spinner.isSpin = false;

      djatyEl.classList.remove('spin');
      this.spinnerText.innerText = '';
      this.spinnerActions.classList.remove('show');

      // Remove whole actions to remove all exist buttons with their handlers.
      this.spinnerActions.innerHTML = '';
      utils.spinner.externalMethodHandler.callMethod('djatyExt.enableDjatyIcon', () => {
        Djaty.logger.info('Enable djaty icon after spinning');
      });
    },

    _getSpinnerEl() {
      const tpl = `
          <div class="spinner-content">
            <div class="spinner"></div>
            <div class="text"></div>
            <div class="actions">
            </div>
            <p class="djaty-marker-spin">Djaty</p>
          </div>
      `;
      const div = document.createElement('div');
      div.className = 'spinner-backdrop';
      div.innerHTML = tpl;
      return div;
    },
  },

  removeCircular(data) {
    const hasProp = Object.prototype.hasOwnProperty;

    function throwsMessage(err) {
      return `[Throws: .${(err ? err.message : '?')}.]`;
    }

    function safeGetValueFromPropertyOnObject(obj, property) {
      if (hasProp.call(obj, property)) {
        try {
          return obj[property];
        } catch (err) {
          Djaty.logger.error('Catch removeCircular bug', err);
          return throwsMessage(err);
        }
      }

      return obj[property];
    }

    const seen = []; // store references to objects we have seen before

    function visit(obj) {
      if (obj === null || typeof obj !== 'object') {
        return obj;
      }

      if (seen.indexOf(obj) !== -1) {
        return '[Circular]';
      }
      seen.push(obj);
      if (obj instanceof HTMLElement) {
        return '[DOM ELEMENT]';
      }

      if (obj instanceof Error) {
        return {
          message: obj.message,
          stack: obj.stack,
        };
      }

      if (typeof obj.toJSON === 'function') {
        try {
          return visit(obj.toJSON());
        } catch (err) {
          Djaty.logger.error('Catch removeCircular visit bug', err);
          return throwsMessage(err);
        }
      }

      if (Array.isArray(obj)) {
        return obj.map(visit);
      }

      return Object.keys(obj).reduce((result, prop) => {
        // prevent faulty defined getter properties
        result[prop] = visit(safeGetValueFromPropertyOnObject(obj, prop));
        return result;
      }, {});
    }
    return visit(data);
  },
  sizeOfObject(object, limit) {
    const objectList = [];
    const result = {
      size: 0,
      uniqueStr: '',
    };
    let exceedLimit = false;
    function recurse(value) {
      if (limit && result.size >= limit) {
        return -1;
      }

      if (typeof value === 'boolean') {
        result.size += 4;
      } else if (typeof value === 'string') {
        result.size += value.length * 2;
      } else if (typeof value === 'number') {
        result.size += 8;
      } else if (typeof value === 'object' && objectList.indexOf(value) === -1) {
        objectList.push(value);
        // eslint-disable-next-line guard-for-in, no-restricted-syntax
        for (const i in value) {
          if (exceedLimit) {
            return result;
          }

          if (objectList.length === 1) {
            result.uniqueStr += `${i}_${typeof i}_${i.length};`;
          }
          result.size += 8; // an assumed existence overhead
          if (recurse(value[i]) === -1) {
            exceedLimit = true;
            result.size = -1;
            return result;
          }
          // setTimeout(() => recurse(value[i]) === -1 && cb(-1));
        }
      }

      return result;
    }

    return recurse(object);
  },
  limitString(title, limit) {
    if (typeof title !== 'string') {
      throw new Error('Title should be string');
    }

    return title.length > limit ? `${title.substring(0, limit)}...` : title;
  },
  generateSelect2El(selector, options, data = []) {
    const select2El = Djaty.libs.$(selector).select2(options);
    let isSelected = false;

    data.forEach(item => {
      const optionEl = Djaty.libs.$('<option></option>').attr('value', item.id).html(item.text);
      if (item.selected) {
        isSelected = true;
        optionEl.attr('selected', item.selected);
      }

      select2El.append(optionEl);
    });

    select2El.data('select2').on('results:message', function onMsg() {
      this.dropdown._positionDropdown();
    });

    select2El[0].disabled = false;

    return Array.isArray(select2El.val()) || isSelected ? select2El : select2El.val(null).trigger('change');
  },
});
