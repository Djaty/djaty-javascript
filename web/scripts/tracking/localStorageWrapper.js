/**
* LocalStorageWrapper Class
*
* The following class designed to wrap localstorage object and prevent any tracker
* from access localstorage obj directly.
*/

// eslint-disable-next-line no-unused-vars
class LocalStorageWrapper {

  /** *********************** Initializing Obj *************************** */
  constructor(itemType, localStorage) {
    this.localStorage = localStorage;
    this.itemType = itemType;
  }

  /* ######################################################################## */
  /* ############################ PUBLIC METHODS ############################ */
  /* ######################################################################## */

  /**
   * Initialization logic by adding needed event handlers.
   *
   * @return  {void}
   */
  set(key, item) {
    const data = this.localStorage.getData(this.itemType);
    data[key] = item;
    this.localStorage.set(this.itemType, data);
  }
}
