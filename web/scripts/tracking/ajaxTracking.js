/**
* Tracking Ajax requests.
*
* This file is combined with other tracking files using 'gulp' then the generated
* file will be injected by the extension or manually by including the file.
*/

/* global Event, URL */

const ajaxTracker = {
  pendingRequests: {},

  /* ###################################################################### */
  /* ########################### PUBLIC METHODS ########################### */
  /* ###################################################################### */

  /** *********************** Initializing Obj **************************** */
  /**
  * Initialization of the tracker.
  *
  * @return void
  */
  init() {

  },

  /**
   * Save Data into timeline.
   *
   * @param  {Object} item
   * @param  {Function} cb
   * @return {void}
   */
  timelineFormatter(item, cb) {
    try {
      if (!Array.isArray(item.reqArgs)) {
        Djaty.logger.log('item', item);
        throw new Error('Make sure you pass "reqArgs" parameter as an array');
      }

      if (typeof item.headers !== 'object') {
        throw new Error('Make sure you pass "headers" parameter as an object');
      }

      // Handle `pending` items
      if (item.state === 'pending') {
        if (typeof item.ajaxCookie !== 'string') {
          throw new Error('Make sure you pass "ajaxCookie" parameter as an string');
        }

        this._formatTimelinePendingObj(item, cb);

        return;
      }

      if (!(item.ev instanceof Event && item.ev.type === 'readystatechange')) {
        throw new Error('timelineFormatter only accept events of type \'readystatechange\'');
      }

      // Handle `finished` items
      this._formatTimelineFinishedObj(item, cb);
    } catch (err) {
      Djaty.logger.warn('Unable to format ajax', {
        originalItem: {
          itemType: 'ajax',
          state: item.state,
          url: item.reqArgs[1],
          method: item.reqArgs[0],
          timestamp: item.time,
        },
      }, err);
      cb({ isIgnored: true });
    }
  },

  /**
   * Get error data for the `pending` item timeline items snapshot.
   *
   * ex: When normal ajax had been called the initial state
   * for it is `pending` with (ex: `10` timeline items),
   * but when this ajax becomes `finished` may main timeline has new timeline items,
   * so I only need the timeline items when ajax is fired not current timeline items.
   *
   * @param reqId
   * @returns {Object}
   */
  getErrorData(reqId) {
    const reqTimelineItem = this.pendingRequests[reqId];
    delete this.pendingRequests[reqId];

    const currentData = Djaty.trackingApp.getTrackingData();
    currentData.timeline = reqTimelineItem;

    return currentData;
  },

  /* ###################################################################### */
  /* ########################### Private METHODS ########################## */
  /* ###################################################################### */
  /**
  * responseText Allowed Types
  *
  * We need to check if ev.target.responseType is allowed because accessing
  * ev.target.responseText for other responseTypes throws an error like the following:
  * {Failed to read the 'responseXML' property from 'XMLHttpRequest': The value
  * is only accessible if the object's 'responseType' is '' or 'document'
  * (was 'arraybuffer').}
  *
  * @param  {String} type
  * @return {Boolean}
  */
  _isTypeAllowed(type) {
    if (typeof type !== 'string') {
      throw new Error('_isTypeAllowed only accept strings');
    }

    return 'document, json, text'.indexOf(type) > -1;
  },

  /**
   * Format timeline object for pending ajax requests.
   *
   * @param item
   * @param  {Function} cb
   * @return {Function}
   */
  _formatTimelinePendingObj(item, cb) {
    const { reqArgs, isAborted, requestPayload, reqId, time,
      ajaxCookie, headers, state } = item;

    if (!Array.isArray(reqArgs)) {
      throw new Error('Make sure you pass "reqArgs" parameter as an array');
    }

    let paramUrl = reqArgs[1];

    reqArgs[0] = reqArgs[0].toUpperCase();
    const djatyRegId = '((djatyReqId|&djatyReqId)=[^&]*(?:&|$))';
    const getDjatyReqId = paramUrl.match(djatyRegId);

    paramUrl = getDjatyReqId ? paramUrl.replace(getDjatyReqId[0], '') : paramUrl;
    const queryParamsObj = Djaty.utils.convertStrToPair(
      paramUrl.slice(paramUrl.indexOf('?') + 1, paramUrl.length), '&', '=');

    reqArgs[1] = this._getFullURL(paramUrl);

    const openParamsProp = ['method', 'url', 'async', 'user', 'password'];
    const openArgs = {};

    reqArgs.forEach((param, index) => {
      openArgs[openParamsProp[index]] = param;
    });

    const formattedObj = {
      timestamp: time,
      openParams: openArgs,
      isAborted,
      reqId,
      statusText: state,
    };

    const headersData = {
      requestHeaders: headers.requestHeaders,
    };

    const cookies = Djaty.utils.convertStrToPair(ajaxCookie, ';', '=');
    const payload = requestPayload && (requestPayload.length < Djaty.constants.requestSizeLimit ?
      requestPayload : 'PAYLOAD_TOO_LONG');

    Djaty.utils.resolveProperty(Djaty.constants.itemType.ajax, formattedObj, 'headers', headersData, Djaty.config.trackingOptions);
    Djaty.utils.resolveProperty(Djaty.constants.itemType.ajax, formattedObj, 'cookies', cookies, Djaty.config.trackingOptions);
    Djaty.utils.resolveProperty(Djaty.constants.itemType.ajax, formattedObj, 'queryParams', queryParamsObj, Djaty.config.trackingOptions);

    if (payload) {
      Djaty.utils.resolveProperty(Djaty.constants.itemType.ajax, formattedObj, 'requestPayload', payload, Djaty.config.trackingOptions);
    }

    const itemIndex = Djaty.initApp.timeline.indexOf(item);
    this.pendingRequests[reqId] = itemIndex === -1 ? Djaty.initApp.timeline.slice() :
      Djaty.initApp.timeline.slice(0, itemIndex);

    this.pendingRequests[reqId].push(item);
    return cb({ formattedObj });
  },

  /**
   * Format timeline object for finished ajax requests
   * (update on the `pending` item for it by reference).
   *
   * @param item
   * @param cb
   * @returns {*}
   * @private
   */
  _formatTimelineFinishedObj(item, cb) {
    const { ev, reqArgs, isAborted, reqId, requestTime, headers, state } = item;

    if (!(ev instanceof Event && ev.type === 'readystatechange')) {
      throw new Error('_formatTimelineObj only accept events of type \'readystatechange\'');
    }

    if (!Array.isArray(reqArgs)) {
      throw new Error('Make sure you pass "reqArgs" parameter as an array');
    }

    if (!this.pendingRequests[reqId]) {
      throw new Error('Unable to reformatting completed ajax without pending data for it.');
    }

    const formattedObj = this.pendingRequests[reqId].slice(-1)[0];
    const djatyRegId = '((djatyReqId|&djatyReqId)=[^&]*(?:&|$))';
    const target = ev.target;

    if (typeof formattedObj.openParams.url === 'string' && (target.status >= 500 || target.status === 0) &&
      Djaty.trackingApp.isIgnoredError(formattedObj.openParams.url)) {
      const timelineItemIndex = Djaty.initApp.timeline.indexOf(formattedObj);

      if (timelineItemIndex !== -1) {
        Djaty.initApp.timeline.splice(timelineItemIndex, 1);
      }

      delete this.pendingRequests[reqId];

      return cb({ isIgnored: true, type: 'error', state });
    }

    const allowedResp = this._isTypeAllowed(target.responseType) ? target.responseText : '';

    formattedObj.status = target.status;
    formattedObj.statusText = target.statusText;
    formattedObj.isAborted = isAborted;

    // will be saved as empty obj as all ev.target attrs are non enumerable
    // and JSON.stringify() ignores non enumerable attrs.
    // response: ev.target,
    // So, lets save needed data only
    const response = {
      responseText: allowedResp.length < Djaty.constants.requestSizeLimit ?
        allowedResp : 'Text too long',
      responseType: target.responseType,
      responseURL: target.responseURL.match(djatyRegId) ? target.responseURL
        .replace(target.response && target.responseURL.match(djatyRegId)[0], '') :
        target.responseURL,
      withCredentials: target.withCredentials,
    };

    const headersData = {
      responseHeaders: Djaty.utils.convertStrToPair(headers.responseHeaders, '\n', ': '),
      requestHeaders: formattedObj.headers && formattedObj.headers.requestHeaders,
    };


    Djaty.utils.resolveProperty(Djaty.constants.itemType.ajax, formattedObj, 'response', response, Djaty.config.trackingOptions);
    Djaty.utils.resolveProperty(Djaty.constants.itemType.ajax, formattedObj, 'headers', headersData, Djaty.config.trackingOptions);
    Djaty.utils.resolveProperty(Djaty.constants.itemType.ajax, formattedObj, 'requestTime', requestTime, Djaty.config.trackingOptions);

    if (Djaty.trackingApp.isTimelineIgnored(formattedObj, Djaty.constants.itemType.ajax)) {
      const timelineItemIndex = Djaty.initApp.timeline.indexOf(formattedObj);

      if (timelineItemIndex !== -1) {
        Djaty.initApp.timeline.splice(timelineItemIndex, 1);
      }

      delete this.pendingRequests[formattedObj.reqId];

      return cb({ isIgnored: true, state });
    }

    if ((target.status >= 500 || target.status === 0) && !isAborted) {
      const sha256 = Djaty.libs.sha256;
      formattedObj.hash = sha256(reqArgs.join(' ') + Djaty.trackingApp.agentId + Djaty.constants.itemType.ajax + formattedObj.status);

      formattedObj.shortTitle = `${formattedObj.openParams.method} ${(new URL(formattedObj.openParams.url)).pathname}`;

      formattedObj.longTitle = Djaty.utils.limitString(
        `Ajax: method ${formattedObj.openParams.method} ${formattedObj.openParams.url}`, Djaty.constants.titleLimit);

      return cb({ formattedObj, type: 'error', state });
    }

    delete this.pendingRequests[formattedObj.reqId];

    return cb({ formattedObj, state });
  },

  _getFullURL(url) {
    const tmpAnchorElement = document.createElement('a');
    tmpAnchorElement.href = url;

    return tmpAnchorElement.href;
  },
};

// Register ajaxTracker component to the parent Djaty tracking app.
Djaty.trackingApp.addTracker(Djaty.constants.itemType.ajax, ajaxTracker);
