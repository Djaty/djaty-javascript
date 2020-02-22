/**
* Tracking Click.
*
* This file is combined with other tracking files using 'gulp' then the generated
* file will be injected by the extension or manually by including the file.
*/

/* global URL */
const clickTracker = {
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
   * @param  {String} ev
   * @param  {Number} time
   * @param  {Function} cb
   * @return {void}
   */
  timelineFormatter({ ev, time }, cb) {
    if (!(Djaty.utils.isInstanceOf('Event', ev))) {
      throw new Error('Make sure you pass "timelineFormatter" parameters correctly');
    }

    clickTracker._formatTimelineObj(ev, time, cb);
  },

  /* ###################################################################### */
  /* ########################### Private METHODS ########################## */
  /* ###################################################################### */
  /**
  * Format timeline object.
  *
  * @param  {String} ev
  * @param  {Number} time
  * @param  {Function} cb
  * @return {Function}
  */
  _formatTimelineObj(ev, time, cb) {
    if (!(Djaty.utils.isInstanceOf('Event', ev))) {
      throw new Error('Make sure you pass "_formatTimelineObj" parameters correctly');
    }

    const formattedObj = {
      tagName: ev.target.nodeName.toLowerCase(),
      path: this.getElementPath(ev.target).slice(3),
      timestamp: time,
    };

    return cb({ formattedObj });
  },

  getElementPath(el, elNumber = 1) {
    if (!el.parentElement || elNumber >= 5) {
      return '';
    }

    const elName = el.nodeName.toLocaleLowerCase();
    const elClassList = el.classList.length ? `.${el.className.split(' ').join('.')}` : '';

    return `${this.getElementPath(el.parentElement, ++elNumber)} >  ${elName}${elClassList}`;
  },
};

// Register clickTracker component to the parent Djaty tracking app.
Djaty.trackingApp.addTracker(Djaty.constants.itemType.click, clickTracker);
