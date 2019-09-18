/**
 * Handling server availability if server offline delay after x**NumberOfRetry sec.
 *
 */
// eslint-disable-next-line no-unused-vars
const buffer = {
  bufferRequests: [],
  numberOfRetry: 0,
  isInitialized: false,
  timeOutRef: null,
  elementsPerRequest: 0,
  bufferRequestLimit: 0,
  serverDelayTime: 0,
  offset: 0,
  autoSubmittedErrorEndPoint: '',
  projectId: undefined,
  appendedData: {},
  shouldBeDestroyed: false,

  /* ###################################################################### */
  /* ########################### PUBLIC METHODS ########################### */
  /* ###################################################################### */
  /**
   * Initialize throttle module
   *
   * @params  {Object} data
   * return {Object}
   */
  init(data) {
    this.isInitialized = true;
    this.elementsPerRequest = Djaty.constants.elementsPerRequest;
    this.bufferRequestLimit = Djaty.constants.bufferRequestLimit;
    this.serverDelayTime = Djaty.constants.serverDelayTime;
    this.appendedData = data;
    return this;
  },

  /**
   * Destroy buffer module
   *
   * Return void
   */
  destroy() {
    if (this.bufferRequests.length) {
      this.shouldBeDestroyed = true;

      return;
    }

    this.isInitialized = false;
    clearTimeout(this.timeOutRef);
    this.elementsPerRequest = 0;
    this.serverDelayTime = 0;
    this.autoSubmittedErrorEndPoint = '';
    this.projectId = '';
    this.appendedData = {};
  },
  /* ###################################################################### */
  /* ########################### Private METHODS ########################## */
  /* ###################################################################### */
  /**
   * Check if server is online or not in case not save requests and recall after delay.
   *
   * @param request
   * @private
   */
  manageBuffer(request) {
    if (typeof Djaty.config.apiKey !== 'string') {
      throw new Error('apiKey required');
    }

    if (!this.isInitialized) {
      throw new Error('You should initialize buffer module before using it.');
    }

    this.bufferRequests = this.bufferRequests.concat(request);
    // If making requests and server still offline discard from beginning to don't exceed limit
    if (this.bufferRequests.length > this.bufferRequestLimit) {
      this.bufferRequests.shift();
    }

    if (this.timeOutRef) {
      return;
    }

    const patch = this.appendedData;
    patch.apiKey = Djaty.config.apiKey;
    let bestLength = request.length;
    if (request.length === 0) {
      bestLength = this.bufferRequests.length > this.elementsPerRequest ? this.elementsPerRequest :
        this.bufferRequests.length;
    }

    patch.agentDataPatch = this.bufferRequests.slice(this.offset, this.offset + bestLength);
    if (!this.timeOutRef) {
      this.offset += bestLength;
    }

    if (!patch.agentDataPatch.length) {
      this.offset = 0;

      if (this.shouldBeDestroyed) {
        this.shouldBeDestroyed = false;
        this.destroy();
      }

      return;
    }

    this._submitRequest(Djaty.utils.assign({}, patch));
  },
  /**
   * Connect to server and if it offline fire it again on the same requests.
   *
   * @private
   */
  _submitRequest(patch) {
    let strPatch = JSON.stringify(patch);
    if (Djaty.config.trackingOptions.removeEmail) {
      strPatch = strPatch.replace(/[0-9a-z._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi, Djaty.constants.privacyPlaceHolder);
    }

    const url = Djaty.config.bugsURL + Djaty.config.api + Djaty.config.apiBugsUrl;

    Djaty.utils.djatyAjax('POST', url, strPatch, err => {
      // If server is offline delay 'delayTime' sec and increase 'numberOfRetry' and try again
      if (err && (err.status >= 500 || err.status === 0)) {
        buffer._serverError(() => {
          this._submitRequest(patch);
        });

        return;
      }

      this.numberOfRetry = 0;
      const IndexOfRequest = buffer.bufferRequests.indexOf(patch.agentDataPatch[0]);
      buffer.bufferRequests.splice(IndexOfRequest, IndexOfRequest + patch.agentDataPatch.length);
      this.offset -= patch.agentDataPatch.length;

      // Sending other patches after patch sending failure and connection returned
      // resend failed patch then other stored patches
      if (buffer.bufferRequests.length) {
        buffer.manageBuffer([]);
      }
    });
  },
  /**
   * Check if return Error retry.
   *
   * @private
   */
  _serverError(cb) {
    let delayTime = 100 ** this.numberOfRetry;

    // If time more than x min retry every x min.
    if (delayTime > this.serverDelayTime) {
      delayTime = this.serverDelayTime;
    }

    // If server still offline increase 'numberOfRetry' to increase delay time.
    this.numberOfRetry++;
    this.timeOutRef = Djaty.utils.djatySetTimeout(() => {
      this.timeOutRef = undefined;
      cb();
    }, delayTime);
  },
};

