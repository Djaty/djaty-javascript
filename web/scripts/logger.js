/**
 * Djaty logger
 * - To show djaty logs enable `debug` flag in Djaty.init options.
 *
 * - When Djaty.logger.error is called we trigger auto reporting for current logs
 *   if `reportDjatyCrashes` is enabled.
 *
 * - When use `Djaty.logger.error`, The first param should be a string describe the error and
 *   last param should be the error object itself, In case of no error object,
 *   I will create error with the first param as a it's message
 */

// eslint-disable-next-line no-unused-vars
Djaty.logger = Djaty.logger || {
  logTimeline: [],
  consoleWrappedMethods: ['log', 'dir', 'error', 'warn', 'info'],
  isInitialized: false,
  _autoReportCb: null,

  /* ###################################################################### */
  /* ########################### PUBLIC METHODS ########################### */
  /* ###################################################################### */
  init(console) {
    if (this.isInitialized) {
      return;
    }

    this.isInitialized = true;
    this.consoleWrappedMethods.forEach(method => {
      this[method] = (...args) => {
        if (this.logTimeline.length > 100) {
          this.logTimeline.shift();
        }

        this.logTimeline.push({ attrName: method, args });

        if (this._autoReportCb && method === 'error') {
          // To avoid passing the reference of logger items during sending,
          // Sending exact loggers items for each bug report.
          this._autoReportCb(this.logTimeline.slice(), args);
        }

        if (this._autoReportCb && method === 'warn') {
          // To avoid passing the reference of logger items during sending,
          // Sending exact loggers items for each bug report.
          this._autoReportCb(this.logTimeline.slice(), args, true);
        }

        if (!Djaty.config.debug && (method !== 'error' || method !== 'warn')) {
          return;
        }

        if (args[0] && typeof args[0] === 'string') {
          args[0] = `Djaty@${Djaty.version}: ${args[0]}`;
        } else {
          args.unshift(`Djaty@${Djaty.version}`);
        }

        console[method](...args);
      };
    });
  },

  registerAutoReportCb(cb) {
    this._autoReportCb = cb;
  },

  removeAutoReportCb() {
    this._autoReportCb = null;
  },
};

