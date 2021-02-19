/**
 * Tracking 'Navigation' methods.
 *
 * This file is combined with other tracking files using 'gulp' then the generated
 * file will be injected by the extension or manually by including the file.
 */

const navigationTracker = {
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
   * @param  {String} itemType
   * @param  {Object} ev
   * @param  {String} url
   * @param  {Number} time
   * @param  {Function} cb
   * @return {void}
   */
  timelineFormatter({ itemType, ev, url, time = Date.now() }, cb) {
    try {
      if (typeof itemType !== 'string') {
        throw new Error('Make sure you pass "itemType" parameter as a string');
      }
      navigationTracker._formatTimelineObj({ attrName: itemType, ev, currentTime: time, url }, cb);
    } catch (err) {
      Djaty.logger.warn('Unable to format navigation', {
        originalItem: {
          itemType: 'navigation',
          timestamp: time,
          url,
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
   * @param {String} attrName
   * @param {Object} ev
   * @param {Number} currentTime
   * @param {String} url
   * @param {Function} cb
   * @returns {*}
   * @private
   */
  _formatTimelineObj({ attrName, ev, currentTime, url }, cb) {
    if (typeof attrName !== 'string') {
      throw new Error('Make sure you pass "attrName" parameter as a string');
    }

    const formattedObj = {
      method: ev.type,
      curPageUrl: url,
      timestamp: currentTime,
    };

    const pageTitle = Djaty.utils.limitString(document.title, Djaty.constants.titleLimit);

    Djaty.utils.resolveProperty(Djaty.constants.itemType.navigation, formattedObj, 'title', pageTitle, Djaty.config.trackingOptions);
    Djaty.utils.resolveProperty(Djaty.constants.itemType.navigation, formattedObj, 'state', ev.state, Djaty.config.trackingOptions);

    if (Djaty.trackingApp.isTimelineIgnored(formattedObj, Djaty.constants.itemType.navigation)) {
      return cb({ isIgnored: true });
    }

    return cb({ formattedObj });
  },
};

// Register consoleTracker component to the parent Djaty tracking app.
Djaty.trackingApp.addTracker(Djaty.constants.itemType.navigation, navigationTracker);
