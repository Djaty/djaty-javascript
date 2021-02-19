/**
* Tracking File Loading.
*
* This file is combined with other tracking files using 'gulp' then the generated
* file will be injected by the extension or manually by including the file.
*/

/* global URL */
const fileTracker = {
  /* ###################################################################### */
  /* ########################### PUBLIC METHODS ########################### */
  /* ###################################################################### */

  /** ************************* Initializing Obj ************************** */
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
   * @param  {Array} node
   * @param  {String} target
   * @param  {String} ev
   * @param  {Number} time
   * @param  {Function} cb
   * @return {void}
   */
  timelineFormatter({ node, target, ev, time }, cb) {
    try {
      if (typeof target !== 'string' || typeof ev !== 'string') {
        throw new Error('Make sure you pass "timelineFormatter" parameters correctly');
      }

      if (!Djaty.utils.isDomElement(node)) {
        throw new Error('Make sure you pass "node" parameter as DOM element');
      }

      fileTracker._formatTimelineObj(node, target, ev, time, cb);
    } catch (err) {
      Djaty.logger.warn('Unable to format ajax', {
        originalItem: {
          itemType: 'file',
          tagName: node.nodeName.toLowerCase(),
          fileStatus: ev,
          timestamp: time,
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
  * @param  {Object} node
  * @param  {String} target
  * @param  {String} ev
  * @param  {Number} time
  * @param  {Function} cb
  * @return {Function}
  */
  _formatTimelineObj(node, target, ev, time, cb) {
    if (typeof target !== 'string' || typeof ev !== 'string') {
      throw new Error('Make sure you pass "_formatTimelineObj" parameters correctly');
    }

    if (!Djaty.utils.isDomElement(node)) {
      throw new Error('Make sure you pass "node" parameter as DOM element');
    }

    const tagName = node.nodeName.toLowerCase();
    const src = node[target];

    if (typeof src === 'string' && ev === 'error' && Djaty.trackingApp.isIgnoredError(src)) {
      return cb({ isIgnored: true, type: 'error' });
    }

    const formattedObj = {
      tagName,
      src,
      fileStatus: ev,
      timestamp: time,
    };

    if (Djaty.trackingApp.isTimelineIgnored(formattedObj, Djaty.constants.itemType.file)) {
      return cb({ isIgnored: true });
    }

    if (ev === 'error') {
      const sha256 = Djaty.libs.sha256;
      formattedObj.hash = sha256(src + Djaty.trackingApp.agentId + Djaty.constants.itemType.file);
      formattedObj.shortTitle = `File: ${(new URL(src)).pathname}`;
      formattedObj.longTitle = Djaty.utils.limitString(`File: <${tagName}> ${src}`,
          Djaty.constants.titleLimit);
      return cb({ formattedObj, type: 'error' });
    }

    return cb({ formattedObj });
  },
};

// Register fileTracker component to the parent Djaty tracking app.
Djaty.trackingApp.addTracker(Djaty.constants.itemType.file, fileTracker);
