/**
* Tracking Click.
*
* This file is combined with other tracking files using 'gulp' then the generated
* file will be injected by the extension or manually by including the file.
*/

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
   * @param  {Event} ev
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
  * @param  {Event} ev
  * @param  {Number} time
  * @param  {Function} cb
  * @return {Function}
  */
  _formatTimelineObj(ev, time, cb) {
    if (!(Djaty.utils.isInstanceOf('Event', ev))) {
      throw new Error('Make sure you pass "_formatTimelineObj" parameters correctly');
    }

    // Ignore our clicks on our extension elements.
    const djatyEl = document.querySelector('.djaty');
    if (djatyEl && djatyEl.contains(ev.target)) {
      return cb({ isIgnored: true });
    }

    let elementPath = this.getElementPath(ev.target).slice(3);

    // Ignore clicks without parent elements.
    if (!elementPath || elementPath === ev.target.nodeName.toLowerCase()) {
      return cb({ isIgnored: true });
    }

    if (elementPath.length >= Djaty.constants.elementPathMaxLength) {
      elementPath = elementPath
        .slice(Djaty.constants.elementPathMaxLength - elementPath.length - 1);
    }

    const formattedObj = {
      tagName: ev.target.nodeName.toLowerCase(),
      path: elementPath,
      timestamp: time,
    };

    return cb({ formattedObj });
  },

  getElementPath(el, elNumber = 1) {
    if (!el.parentElement || elNumber >= 5) {
      return '';
    }

    const elName = el.nodeName.toLocaleLowerCase();

    // Use `el.getAttribute('class') instead of `el.className` because it may have
    // `SVGAnimatedString` for SVG elements
    let elClassList = (el.getAttribute('class') || '').trim() ?
      `.${el.getAttribute('class').split(' ').join('.')}` : '';

    if (elNumber === 1) {
      elClassList += el.type ? `[type=${el.type}]` : '';
      elClassList += el.name ? `[name=${el.name}]` : '';
      elClassList += el.innerText ? `[text=${el.innerText.trim().slice(0, 20)}]` : '';
    }

    return `${this.getElementPath(el.parentElement, ++elNumber)} > ${elName}${elClassList}`;
  },
};

// Register clickTracker component to the parent Djaty tracking app.
Djaty.trackingApp.addTracker(Djaty.constants.itemType.click, clickTracker);
