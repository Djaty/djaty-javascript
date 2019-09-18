/**
 * Tracking Errors.
 *
 * This file is combined with other tracking files using 'gulp' then the generated
 * file will be injected by the extension or manually by including the file.
 */

const exceptionTracker = {
  /* ###################################################################### */
  /* ########################### PUBLIC METHODS ########################### */
  /* ###################################################################### */

  /** ************************** Initializing Obj ************************* */
  /**
   * Initialization of the tracker.
   *
   * @return void
   */
  init() {},

  /**
   * push stack trace into our time line
   * @param  {Error} [err=null]
   * @param  {String} msg: Used in case err param is null.
   *                       One case could be:
   *                       blog.sentry.io/2016/05/17/what-is-script-error.html
   * @param  {Number} time
   * @param  {Function} cb
   * @return {void}
   */
  timelineFormatter({ err = null, msg, time = Date.now() }, cb) {
    if (typeof msg === 'string' && Djaty.trackingApp.isIgnoredError(msg)) {
      cb({ isIgnored: true, type: 'error' });
      return;
    }

    let frameList = [];

    if (err && err.stack) {
      frameList = err.stack.split('\n');

      // Handle removing message from stacktrace except `Firefox`,
      // it don't have a error message in his stacktrace.
      const { userAgent } = Djaty.trackingApp.getAgentConstData();
      if (userAgent.browser.name !== 'Firefox') {
        frameList.shift();
      }
    }

    exceptionTracker._formatTimelineObj(err, msg, frameList, time, cb);
  },

  /* ###################################################################### */
  /* ########################### Private METHODS ########################## */
  /* ###################################################################### */
  /**
   * Format timeline object.
   * @param  {Array} err
   * @param  {String} message
   * @param  {Object} stackframes
   * @param  {Number} time
   * @param  {Function} cb
   * @return {Function} cb
   * @TODO return false needs to be handled.
   */
  _formatTimelineObj(err, message, stackframes, time, cb) {
    const msg =
      err ? err.toString() : 'Error from an external resource and details are' +
        ' restricted by browser for security reasons. <a href="#">Read more!</a>';
    // if (!msg) {
    //   msg = message ? message : 'Error';
    // }

    // If stack is generated, we need to remove our stack frames from it(Those
    // frames include for example this function 'timelineFormatter'.
    // Our frames will only exist in case the error is triggered after the djaty core
    // loads. If error triggered with the initial tracker 'initApp' it will be
    // saved into time line at once and without any processing with pure stack
    // frames. Those frames will be processed and added directly inside timetime
    // without being passed to timelineFormatter for example.
    stackframes = stackframes.filter(frame => {
      const functionName = frame.functionName;
      if (functionName && functionName.match(/(timelineFormatter|_errHandler)/)) {
        return false;
      }

      return frame;
    });

    // If no stackframes after filtering, this err is for sure thrown from our
    // scripts and should rejected (not to be tracked).
    if (stackframes.length === 0) {
      // @TODO Handle our exceptions.
      return cb({ isIgnored: true });
    }

    if (stackframes.length >= Djaty.config.stacktraceLimit) {
      stackframes = stackframes.splice(0, Djaty.config.stacktraceLimit);
    }

    const sha256 = Djaty.libs.sha256;
    const hash = sha256(JSON.stringify(stackframes[0]) + msg + Djaty.trackingApp.agentId +
        Djaty.constants.itemType.exception);

    const details = err ? `\nStacktrace: \n${err.stack}` : '';
    const shortTitle = Djaty.utils.limitString(`${msg}`, Djaty.constants.titleLimit);
    const longTitle = Djaty.utils.limitString(`Unhandled Exception: ${msg} . ${details}`,
        Djaty.constants.titleLimit);

    const formattedObj = {
      // Important attr summary, it helps getting a string from the object.
      // summary: `Unhandled Exception: ${msg}. ${details}`,
      method: 'onerror',
      timestamp: time,
      stringifiedStack: err ? err.stack : '',
      msg,
      hash,
      shortTitle,
      longTitle,
    };

    Djaty.utils.resolveProperty(Djaty.constants.itemType.exception, formattedObj, 'repetitionCount', 1, Djaty.config.trackingOptions);

    if (Djaty.trackingApp.isTimelineIgnored(formattedObj, Djaty.constants.itemType.exception)) {
      return cb({ isIgnored: true });
    }

    return cb({ formattedObj, type: 'error' });
  },
};

// Register errorTracker component to the parent Djaty tracking app.
Djaty.trackingApp.addTracker(Djaty.constants.itemType.exception, exceptionTracker);
