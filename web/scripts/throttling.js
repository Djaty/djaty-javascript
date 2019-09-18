/**
 * Throttling error requests
 * Managing incoming requests to send x request per y sec
 *
 */
/* global  buffer */

// eslint-disable-next-line no-unused-vars
const throttle = {
  requests: [],
  isInitialized: false,
  timeoutRef: null,
  elementsPerRequest: 0,
  delayTimePerRequest: 0,
  elementsForAllRequests: 0,
  buffer: null,
  shouldBeDestroyed: false,

  /* ###################################################################### */
  /* ########################### PUBLIC METHODS ########################### */
  /* ###################################################################### */
  /**
   * Initialize throttle module
   *
   * @param  {Object} data
   * return {Object}
   */
  init(data) {
    this.isInitialized = true;
    this.elementsPerRequest = Djaty.constants.elementsPerRequest;
    this.elementsForAllRequests = Djaty.constants.elementsForAllRequests;
    this.delayTimePerRequest = Djaty.constants.delayTimePerRequest;
    this.buffer = buffer.init(data);
    return this;
  },
  /**
   * This method manage requests to send x 'elementsPerRequest' to y second.
   *
   * @param {Array} request
   * return void
   */
  ManageThrottling(request) {
    if (!this.isInitialized) {
      throw new Error('You should initialize throttle module before using it.');
    }
    // Storing all request to array expect empty one.
    this.requests.push(request);

    // If making requests and timeout still process discard from beginning to don't exceed limit
    if (this.requests.length > this.elementsForAllRequests) {
      this.requests.shift();
    }

    // Don't make anther timeout when i actually making one.
    if (this.timeoutRef) {
      return;
    }
    // Serve 'elementsPerRequest' request if 'requests' not empty call it again and serve
    // 'elementsPerRequest' so on after 'delayTimePerRequest'.
    (function serveAllRequests() {
      throttle.timeoutRef = Djaty.utils.djatySetTimeout(() => {
        throttle.buffer.manageBuffer(throttle.requests.splice(0, throttle.elementsPerRequest));
        throttle.timeoutRef = undefined;
        // If there more requests in our object they need to serve so recall
        // ManageThrottling again with empty object till serve all requests.
        if (throttle.requests.length) {
          serveAllRequests();

          return;
        }

        if (throttle.shouldBeDestroyed) {
          throttle.shouldBeDestroyed = false;
          throttle.destroy();
        }
      }, throttle.delayTimePerRequest);
    }());
  },
  /**
   * Destroy throttle module
   *
   * return void
   */
  destroy() {
    if (this.requests.length) {
      this.shouldBeDestroyed = true;

      return;
    }

    this.isInitialized = false;
    clearTimeout(this.timeoutRef);
    this.elementsPerRequest = 0;
    this.elementsForAllRequests = 0;
    this.delayTimePerRequest = 0;
    buffer.destroy();
  },
};

