/**
 * Browser Data
 *
 */
// eslint-disable-next-line no-unused-vars
const browserData = {
  /* ###################################################################### */
  /* ########################### PUBLIC METHODS ########################### */
  /* ###################################################################### */
  /**
   * Get browser storage data like localStorage, sessionStorage, cookies, ...
   *
   * @return void
   */
  getData() {
    const data = {};
    const dataStores = ['localStorage', 'sessionStorage'];

    // get all data
    dataStores.forEach(store => {
      // Get cloned data to prevent editing the real data.
      const storeData = window[store] ? window[store] : {};
      data[store] = Djaty.utils.assign({}, storeData);
    });

    data.cookies = document.cookie;

    // remove internal Djaty data
    delete data.localStorage.DjatyTracking;

    // Read IndexedDB data .. according to Basem, let it for now
    // if (window.indexedDB) {
    //   window.indexedDB.webkitGetDatabaseNames().addEventListener('success', ev => {
    //     Djaty.utils.forOwn(ev.target.result, (key, dbName) => {
    //       if (!isNaN(key)) {
    //         console.log(dbName);
    //       }
    //     });
    //   });
    // }

    return data;
  },
};
