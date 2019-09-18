/**
 * Configuration file
 *
 */
let Djaty = window.Djaty;
window.Djaty = Djaty = Djaty || {};
Djaty.config = Djaty.config || {
  apiUrl: 'https://djaty.com',
  bugsURL: 'https://bugs.djaty.com',
  cdnPath: 'https://cdn.djaty.com',
  api: '/api',
  allowAutoSubmission: true,
  apiBugsUrl: '/bugs',
  debug: false,
  mode: 'default',
  timelineLimit: 30,
  stackTraceLimit: 40,

  reportDjatyCrashes: true,
};

// eslint-disable-next-line
Djaty.DjatyError = class DjatyError extends Error {
  constructor(message) {
    super(`[Djaty] ${message}`);
  }
};
