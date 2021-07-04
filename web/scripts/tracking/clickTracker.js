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
    try {
      if (!(Djaty.utils.isInstanceOf('Event', ev))) {
        throw new Error('Make sure you pass "timelineFormatter" parameters correctly');
      }

      clickTracker._formatTimelineObj(ev, time, cb);
    } catch (err) {
      Djaty.logger.warn('Unable to format click', {
        originalItem: {
          itemType: 'click',
          tagName: ev.target.nodeName.toLowerCase(),
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

    let elementPath = this.getElementPath(ev.target).slice(0, -3);

    // Ignore clicks without parent elements.
    if (!elementPath || elementPath === ev.target.nodeName.toLowerCase()) {
      return cb({ isIgnored: true });
    }

    if (elementPath.length >= Djaty.constants.elementPathMaxLength) {
      elementPath = elementPath.slice(0, Djaty.constants.elementPathMaxLength);
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
      elClassList += el.innerText ? `[text=${el.innerText.trim().slice(0, 50)}]` : '';
    }

    return `${elName}${elClassList} < ${this.getElementPath(el.parentElement, ++elNumber)}`;
  },
};

// Register clickTracker component to the parent Djaty tracking app.
Djaty.trackingApp.addTracker(Djaty.constants.itemType.click, clickTracker);
