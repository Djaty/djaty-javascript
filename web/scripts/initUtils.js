/* ########################################################################## */
/* ######################## COMMONLY USED FUNCTIONS ######################### */
/* ########################################################################## */

/* global HTMLElement, NodeList */

const utils = Djaty.utils = Djaty.utils || {
  originalAddEventListener: null,
  setOriginalAddEventListener(orgFunction) {
    if (this.originalAddEventListener) {
      return;
    }

    this.originalAddEventListener = orgFunction;
  },
  originalRemoveEventListener: null,
  setOriginalRemoveEventListener(orgFunction) {
    if (this.originalRemoveEventListener) {
      return;
    }

    this.originalRemoveEventListener = orgFunction;
  },
  /**
   * Iterate over objects
   *
   * @param  {Object}   obj : target object
   * @param  {Function} cb  : callback
   * @return {void}
   */
  forOwn(obj, cb) {
    // Error Handling
    if (!(Djaty.utils.isInstanceOf('Object', obj))) {
      throw new Error('Make sure you pass "forOwn" obj parameter as an object');
    }

    if (typeof cb !== 'function') {
      throw new Error('Make sure you pass "forOwn" cb parameter as a function');
    }

    const has = Object.prototype.hasOwnProperty;
    // for..in.. will iterate object attr even it was inherited from parents
    // eslint-disable-next-line no-restricted-syntax
    for (const x in obj) {
      // check if obj has that attr originally not from its parents
      if (!has.call(obj, x)) {
        continue;
      }

      cb(x, obj[x]);
    }
  },

  /**
   * Returns true if it is a DOM element
   *
   * @param  {Object} o
   * @return {Boolean}
   */
  isDomElement(o) {
    return (
      typeof HTMLElement === 'object' ? o instanceof HTMLElement :
        o && typeof o === 'object' && o !== null && o.nodeType === 1 &&
        typeof o.nodeName === 'string');
  },

  /**
   * Add try/catch functionality for callback of Djaty async methods like
   * (AddEventListeners, ajax, setTimeout, ..)
   *
   * @param {String} methodName
   * @param {Object} context
   * @param {Function} wrappingOp
   */
  getTryCatchHandler(methodName, context, wrappingOp) {
    if (!utils.originalAddEventListener) {
      throw new Djaty.DjatyError('Can\'t Set CB handler without originalAddEventListener');
    }

    return function getTryCatchHandler(...args) {
      args.forEach((item, index) => {
        if (typeof item !== 'function') {
          return;
        }
        args[index] = function asyncCb(...cbArgs) {
          try {
            item.apply(this, cbArgs);
          } catch (err) {
            if (err instanceof Djaty.DjatyError) {
              throw err;
            }

            const itemDetails = typeof item === 'function' ? `the item.toString is ${item.toString()}` :
              `the item is not a function ${item}`;

            Djaty.logger.error('Catch async methods (listeners, .. ) error message for ' +
             `method '${methodName}' is the async callback with type '${typeof item}' still ` +
              `exists: '${!!item}' the item details is ${itemDetails}`, err);
          }
        };
        if (wrappingOp) {
          wrappingOp(args[index]);
        }
      });

      // Use original addEventListener on our events
      if (methodName === 'addEventListener') {
        return utils.originalAddEventListener.call(context, ...args);
      }

      return context[methodName](...args);
    };
  },
  /**
   * Merge two objects recursively
   *
   * @param {Object} obj1
   * @param {Object} obj2
   * @return {Object}
   */
  mergeRecursive(obj1, obj2) {
    // eslint-disable-next-line
    for (let p in obj2) {
      // Property in destination object set; update its value.
      if (obj2[p] && obj2[p].constructor === Object) {
        const nestedObj = obj1[p] ? this.mergeRecursive(obj1[p], obj2[p]) : obj2[p];
        obj1[p] = utils.assign({}, obj1[p], nestedObj);
      } else {
        obj1[p] = obj2[p];
      }
    }

    return obj1;
  },
  /**
   * Clone an object and return new reference
   * @param obj
   * @return {*}
   */
  clone(obj) {
    if (obj === null || obj === undefined) {
      return {};
    }

    if (typeof obj !== 'object' || 'isActiveClone' in obj) {
      return obj;
    }

    let temp = null;
    if (obj instanceof Date) {
      temp = new obj.constructor(); // or new Date(obj);
    } else {
      temp = obj.constructor();
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        obj.isActiveClone = null;
        temp[key] = utils.clone(obj[key]);
        delete obj.isActiveClone;
      }
    }

    return temp;
  },
  /* eslint-disable no-tabs */
  /**
   * @Duplicated
   *
   * Validate class options against an option structure object.
   *
   * Example for the option structure object:
   *   const optStruct = {
   *     option: {
   *       // Types for target
   *       types: ['number', 'string'],
   *
   *       // Expected values
   *       allowedValues: ['foo', 'bar'],
   *
   *			// Type of child type like array not support nested object inside array
     *   		items: 'selectorOrEl' (Valid only with option "type: array")
   *
   *       // Required property
   *       required: false,
   *
   *       // Prevent adding additional properties default true
   *       additionalProperties: true,
   *
   *       // Has type constrains: Each type may have constrains.
   *       constrains: {
   *        maxLength: 10,
   *        ...
   *        }
   *     },
   *   };
   *
   * @param  {String} label : Class name
   * @param  {Object} optStruct : key/value opt structure
   * @param  {Object} target
   * @return {void}
   */
  /* eslint-disable no-tabs */
  checkerType: {
    string: {
      checker: target => typeof target === 'string',
      constrains: {
        maxLength: (target, maxLength) => target.length <= maxLength,
        minLength: (target, minLength) => target.length >= minLength,
        ignoredCharacters: (target, chars) => !chars.some(char => target.indexOf(char) !== -1),
        isNaN: target => !!(target && isNaN(target)),
      },
    },
    array: {
      checker: target => Array.isArray(target),
      constrains: {
        maxItems: (target, maxItems) => target.length <= maxItems,
        minItems: (target, minItems) => target.length >= minItems,
        uniqueItems: (target, isUnique) => !(isUnique && target
          .some((value, idx, self) => !(self.indexOf(value) === idx))),
      },
    },
    number: {
      checker: target => typeof target === 'number',
    },
    boolean: {
      checker: target => typeof target === 'boolean',
    },
    object: {
      checker: target => target.toString() === '[object Object]',
    },
    function: {
      checker: target => typeof target === 'function',
    },
    isSelectorOrEl: {
      checker: target => {
        let elements;
        if (typeof target === 'string') {
          elements = document.querySelectorAll(target);
        }

        return Djaty.utils.isDomElement(target) || (elements && elements.length);
      },
    },
  },

  validate(label, struct, target) {
    const allowedValues = struct.allowedValues;

    if (struct.required && target === undefined) {
      throw new Djaty.DjatyError(`property ${label} is required`);
    }

    if (target === undefined) {
      return;
    }

    if (struct.additionalProperties === false && struct.properties) {
      const objKeys = Object.keys(target);
      const structKeysKeys = Object.keys(struct.properties);

      if (objKeys.length > structKeysKeys.length ||
        objKeys.some(key => struct.properties[key] === undefined)) {
        throw new Djaty.DjatyError(`${label} should not have additional properties.`);
      }
    }

    const allowedType = struct.types.some(type => {
      if (type === 'object' && struct.properties && target.toString() === '[object Object]') {
        utils.forOwn(struct.properties, (propName, propStruct) => {
          utils.validate(propName, propStruct, target[propName]);
        });
      } else if (type === 'array' && struct.items && Array.isArray(target)) {
        target.forEach(child => {
          utils.validate(label, struct.items, child);
        });
      }

      const correctType = utils.checkerType[type].checker(target);

      if (!utils.checkerType[type].constrains || !correctType) {
        return correctType;
      }

      utils.forOwn(utils.checkerType[type].constrains, (constrainKey, constrainFunction) => {
        // Return if no constrain in object structure or object structure has current constrain
        // and pass it.
        if (!struct.constrains || struct.constrains[constrainKey] === undefined ||
          constrainFunction(target, struct.constrains[constrainKey])) {
          return;
        }

        throw new Djaty.DjatyError(`property '${label}' value '${target}' for type: '${type}' should pass constrain '${constrainKey}'`);
      });

      return correctType;
    });

    if (!allowedType) {
      throw new Djaty.DjatyError(`property '${label}' should be one of those types: '${struct.types}'`);
    }

    if (allowedValues && allowedValues.indexOf(target) < 0) {
      // check if the value is allowed
      throw new Djaty.DjatyError(`'${label}' expects value options to be one of ` +
        `"${allowedValues.join(', ')}"`);
    }
  },
  /**
   * Add eventListener on a node and save this node, eventName and cb to an array 'NodeListeners'
   *
   * @param {Array} addedListeners
   */
  addEventListenerAndSaveIt(addedListeners) {
    addedListeners.forEach(listener => {
      const djatyAddEventListener = utils.getTryCatchHandler('addEventListener', listener.node, wrappedFn => {
        listener.nodeListeners.push(
          { node: listener.node, eventName: listener.eventName, cb: wrappedFn });
      });

      djatyAddEventListener(listener.eventName, listener.cb);
    });
  },

  /**
   * Convert NodeList to Array
   *
   * @param  {NodeList} arrAlike
   * @return {Array}
   */
  nodeListToArr(arrAlike) {
    // Error Handling
    if (!Djaty.utils.isInstanceOf('NodeList', arrAlike)) {
      throw new Error('"nodeListToArr" expects arrAlike parameter to be NodeList');
    }

    return Array.prototype.slice.call(arrAlike);
  },
  /**
   * Object.assign Polyfill for old browsers.
   *
   * @param {Array} args
   * return Object
   */
  assign(...args) {
    if (typeof Object.assign === 'function') {
      return Object.assign(...args);
    }

    const target = args[0];
    // We must check against these specific cases.
    if (target === undefined || target === null) {
      throw new TypeError('Cannot convert undefined or null to object');
    }

    const output = Object(target);
    for (let index = 1; index < args.length; index++) {
      const source = args[index];
      if (source !== undefined && source !== null) {
        this.forOwn(source, (key, value) => {
          output[key] = value;
        });
      }
    }
    return output;
  },

  externalMethodHandler: {
    ns: '',
    listeners: {},
    exposedMethods: {},
    nodeListeners: [],
    /**
     * Send data to extension method and save cb
     *
     * @param {String} targetMethodName
     * @param {Array} args
     */
    callMethod(targetMethodName, ...args) {
      const targetMethodNameArr = targetMethodName.split('.');
      const cb = args[args.length - 1];

      const evDetails = {
        sourceNS: Djaty.utils.externalMethodHandler.ns,
        targetNS: targetMethodNameArr[0],
        method: `${targetMethodNameArr[1]}-${Date.now()}${Math.floor(Math.random() * 1e3)}`,
        type: 'call',
        data: args.slice(0, args.length - 1) || [],
      };

      window.postMessage(evDetails, '*');

      if (typeof cb !== 'function') {
        return;
      }

      Djaty.utils.externalMethodHandler.listeners[evDetails.method] = cb;
    },
    /**
     * When response fire all cb for this event then delete them.
     *
     * @param {String} sourceNS
     * @param {String} method
     * @param {String} type
     * @param {Object} data
     */
    handleMethodResp({ sourceNS, method, type, data }) {
      if (!sourceNS || !type || sourceNS !== Djaty.utils.externalMethodHandler.ns || type !== 'resp') {
        return;
      }

      if (Djaty.utils.externalMethodHandler.listeners[method]) {
        Djaty.utils.externalMethodHandler.listeners[method](...data);
        delete Djaty.utils.externalMethodHandler.listeners[method];
      }
    },
    /**
     * Call when i want to fire exposed method.
     *
     * @param {Object} evDetails
     */
    handleMethodCall(evDetails) {
      const targetArgs = evDetails.data || [];

      targetArgs.push((...args) => {
        evDetails.type = 'resp';
        evDetails.data = args;

        window.postMessage(evDetails, '*');
      });

      Djaty.utils.externalMethodHandler.exposedMethods[evDetails.method.split('-')[0]](...targetArgs);
    },
    /**
     * Add exposed methods to run
     *
     * @param {Array} addedMethods
     */
    addExposedMethods(addedMethods) {
      Djaty.utils.externalMethodHandler.exposedMethods = Djaty.utils.assign({},
        Djaty.utils.externalMethodHandler.exposedMethods, addedMethods);
    },
    /**
     * Listen for all call and response event between external component.
     *
     * @param {Object} evDetails
     */
    listenCallResp({ data: evDetails }) {
      if (!evDetails || !evDetails.targetNS || !evDetails.sourceNS ||
        (evDetails.sourceNS === Djaty.utils.externalMethodHandler.ns && evDetails.type === 'call') ||
        (evDetails.targetNS === Djaty.utils.externalMethodHandler.ns && evDetails.type === 'resp')) {
        return;
      }

      if (evDetails.sourceNS === Djaty.utils.externalMethodHandler.ns && evDetails.type === 'resp') {
        Djaty.utils.externalMethodHandler.handleMethodResp(evDetails);
      }

      if (evDetails.targetNS === Djaty.utils.externalMethodHandler.ns && evDetails.type === 'call') {
        Djaty.utils.externalMethodHandler.handleMethodCall(evDetails);
      }
    },
    /**
     * Init Djaty.utils.externalMethodHandler and add listen for every event on 'message'.
     *
     * @param {String} ns
     */
    init(ns) {
      Djaty.utils.externalMethodHandler.ns = ns;

      Djaty.utils.addEventListenerAndSaveIt([
        { nodeListeners: Djaty.utils.externalMethodHandler.nodeListeners,
          node: window,
          eventName: 'message',
          cb: Djaty.utils.externalMethodHandler.listenCallResp },
      ]);
    },
    /**
     * Destroy Djaty.utils.externalMethodHandler and add listen for every event on 'message'.
     *
     */
    destroy() {
      this.nodeListeners.forEach(listener => {
        utils.originalRemoveEventListener.call(listener.node, listener.eventName, listener.cb);
      });

      Djaty.utils.externalMethodHandler.ns = '';
      Djaty.utils.externalMethodHandler.listeners = {};
      this.nodeListeners = [];
    },
  },
  /**
   * Is instance of target (object/event/array/...) has type of a specific type
   *
   * The checking is recursively to compare this type with the current target type
   * and with his parents types.
   *
   * We avoid to check with the class itself or builtin instanceof method
   * because of they are working for elements in the same window,
   * not for different windows or not with the current window and embedded iframes.
   *
   * @param type
   * @param target
   * @returns {*}
   */
  isInstanceOf(type, target) {
    if (target.constructor.name === type) {
      return true;
    }

    // I used __proto__ to compare the type with the parent class type
    // ex: the `KeyboardEvent` class is child for `Event` class
    // but I need to check the target that has type `Event`.
    // eslint-disable-next-line no-proto
    if (!target.__proto__) {
      return false;
    }

    // eslint-disable-next-line no-proto
    return this.isInstanceOf(type, target.__proto__);
  },
};
