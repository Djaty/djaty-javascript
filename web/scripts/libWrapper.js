Djaty.libs = {};

const libs = [
  {
    name: 'UAParser',
    path: '../../bower_components/ua-parser-js/src/ua-parser.js',
  },
  {
    name: 'sha256',
    path: '../../bower_components/js-sha256/src/sha256.js',
  },
];

// eslint-disable-next-line no-unused-vars
(function libWrapper(Djaty, djatyLibs, require, define, exports) {
  const oldLibs = {};
  djatyLibs.forEach(lib => {
    const name = lib.name;
    oldLibs[name] = window[name];
  });

  // =Inject Libs

  // here right after injection, libs are injected at window.
  djatyLibs.forEach(lib => {
    const name = lib.name;
    Djaty.libs[name] = window[name];

    // Now delete the added lib and if it was already at window restore it.
    window[name] = oldLibs[name];
  });

// If lib deals with this as if it was the window obj, "this" inside our closure
// is not the window (undefined because of 'use strict');
}).call(window, Djaty, libs);
