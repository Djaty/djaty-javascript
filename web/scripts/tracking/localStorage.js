/**
 * LocalStorage Handler Singleton.
 *
 * This obj deals with localStorage to save/load data. It also makes elementary
 * processes like limiting localStorage size.
 */

/* global localStorage */
const djatyLocalStorage = {

  /* ###################################################################### */
  /* ########################### PUBLIC METHODS ########################### */
  /* ###################################################################### */

  /**
   * Save new data to localStorage.
   *
   * @param {String} key
   * @param {Object} item
   * @return {void}
   */
  set(key, item) {
    if (!key || !item) {
      throw new Error('You must provide \'key\' and item');
    }

    if (typeof key !== 'string') {
      throw new Error('push \'key\' must be a string');
    }

    let localStorageStr = localStorage.getItem('DjatyTracking');
    const localStorageObj = localStorageStr ? JSON.parse(localStorageStr) : {};

    localStorageObj[key] = item;

    localStorageStr = JSON.stringify(Djaty.utils.removeCircular(localStorageObj));
    // localStorageStr = JSON.stringify(localStorageObj);
    localStorage.setItem('DjatyTracking', localStorageStr);
  },

  /**
   * load data from localStorage.
   *
   * @param {String} key
   * @return {Object}
   */
  getData(key = null) {
    if (key && typeof key !== 'string') {
      throw new Error('load \'key\' must be a string');
    }

    const localStorageStr = localStorage.getItem('DjatyTracking');
    const localStorageObj = localStorageStr ? JSON.parse(localStorageStr) : {};

    // Return cloned data to prevent editing the real localStorage data.
    // Get the whole object if no key is passed.
    if (!key) {
      return Djaty.utils.assign({}, localStorageObj);
    }

    const item = localStorageObj[key] ? localStorageObj[key] : {};
    return Djaty.utils.assign({}, item);
  },

  /**
   * remove data from localStorage.
   *
   * @param {String} key
   * @return {void}
   */
  remove(key) {
    if (!key || typeof key !== 'string') {
      throw new Error('load \'key\' must be a string');
    }

    let localStorageStr = localStorage.getItem('DjatyTracking');
    const localStorageObj = localStorageStr ? JSON.parse(localStorageStr) : {};
    delete localStorageObj[key];
    localStorageStr = JSON.stringify(Djaty.utils.removeCircular(localStorageObj));
    localStorage.setItem('DjatyTracking', localStorageStr);
  },

  /* ###################################################################### */
  /* ########################### PRIVATE METHODS ########################## */
  /* ###################################################################### */
};

Djaty.trackingApp.registerLocalStorage(djatyLocalStorage);
