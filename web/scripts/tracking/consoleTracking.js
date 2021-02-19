/**
* Tracking 'window.console' methods.
*
* This file is combined with other tracking files using 'gulp' then the generated
* file will be injected by the extension or manually by including the file.
*/

const consoleTracker = {
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
  * @param  {String} attrName
  * @param  {Array} args
  * @param  {Function} cb
  * @return {void}
  */
  timelineFormatter({ attrName, args }, cb) {
    try {
      if (typeof attrName !== 'string') {
        throw new Error('Make sure you pass "attrName" parameter as a string');
      }

      if (!Array.isArray(args)) {
        throw new Error('Make sure you pass "args" parameter as an array');
      }

      this._formatTimelineObj(attrName, args, cb);
    } catch (err) {
      Djaty.logger.warn('Unable to format console', {
        originalItem: {
          itemType: 'console',
          attrName,
          timestamp: Date.now(),
        },
      }, err);
      cb({ isIgnored: true });
    }
  },

  /* ###################################################################### */
  /* ########################### Private METHODS ########################## */
  /* ###################################################################### */
  /**
   * Format timeline object.
   *
   * @param  {String} attrName
   * @param  {Array} args
   * @param  {Function} cb
   * @return {void}
   */
  _formatTimelineObj(attrName, args, cb) {
    if (typeof attrName !== 'string') {
      throw new Error('Make sure you pass "attrName" parameter as a string');
    }

    if (!Array.isArray(args)) {
      throw new Error('Make sure you pass "args" parameter as an array');
    }

    if (!args.length) {
      cb({ isIgnored: true });

      return;
    }

    const timestamp = Date.now();
    const sizeObject = Djaty.utils.sizeOfObject(args, Djaty.constants.requestSizeLimit);
    const formattedObj = {
      method: attrName,
      timestamp,
      consoleParams: sizeObject.size === -1 ? [] : Djaty.utils.removeCircular(args),
      isTrimmed: sizeObject.size === -1,
    };

    let stringifiedParams = '[TOO_LONG_OBJECT_SIZE]';
    if (Djaty.utils.resolveProperty(Djaty.constants.itemType.console, formattedObj,
        'repetitionCount', 1, Djaty.config.trackingOptions) || attrName === 'error') {
      const sha256 = Djaty.libs.sha256;

      if (sizeObject.size === -1) {
        formattedObj.hash = sha256(sizeObject.uniqueStr + Djaty.trackingApp.agentId
            + Djaty.constants.itemType.console + attrName);
      } else {
        stringifiedParams = JSON.stringify(formattedObj.consoleParams);
        stringifiedParams = stringifiedParams.substr(1, stringifiedParams.length - 2);

        formattedObj.hash = sha256(stringifiedParams + window.history.origin + attrName);
      }
    }

    if (Djaty.trackingApp.isTimelineIgnored(formattedObj, Djaty.constants.itemType.console)) {
      cb({ isIgnored: true });

      return;
    }

    cb({ formattedObj });
  },
};

// Register consoleTracker component to the parent Djaty tracking app.
Djaty.trackingApp.addTracker(Djaty.constants.itemType.console, consoleTracker);
