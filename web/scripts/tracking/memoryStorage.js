/**
* Memory Storage Handler Singleton.
*
* This obj deals with memory to save/load data.
*/

const memoryStorage = {
  container: {},

  /* ###################################################################### */
  /* ########################### PUBLIC METHODS ########################### */
  /* ###################################################################### */
  /**
   * Save new data to memory.
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

    const memoryObj = this.container;
    memoryObj[key] = item;
  },

  /**
  * load data from memory.
  *
  * @param {String} key
  * @return {Object}
  */
  getData(key = null) {
    if (key && typeof key !== 'string') {
      throw new Error('load \'key\' must be a string');
    }

    const memoryObj = this.container;

    // Return cloned data to prevent editing the real memory data.
    // Get the whole object if no key is passed.
    if (!key) {
      return Djaty.utils.assign({}, memoryObj);
    }

    return Djaty.utils.assign([], memoryObj[key]);
  },

  /* ###################################################################### */
  /* ########################### PRIVATE METHODS ########################## */
  /* ###################################################################### */
};

Djaty.trackingApp.registerMemoryStorage(memoryStorage);
