/**
 * Auto report our bugs to djaty server.
 *
 * When `Djaty.logger.error` is fired and `reportDjatyCrashes` still `true` we trigger auto
 * reporting for current logs then destroy Djaty then show error for user to know that
 * something went wrong.
 *
 * In case of user disable `reportDjatyCrashes` flag just destroy and show error for user to know
 * that something went wrong and ask him to re-enable `reportDjatyCrashes` flag to have better
 * experience.
 */

// eslint-disable-next-line no-unused-vars
const autoReport = {
  isInitiated: false,
  logsFormattingCb: null,
  exceptionFormattingCb: null,
  constData: null,

  autoReport(loggerTimelineItems, logErrorParams) {
    try {
      let errorMessage = 'Something went wrong with Djaty';
      if (!this.isInitiated) {
        return;
      }

      if (!Djaty.config.reportDjatyCrashes) {
        errorMessage += ' but we are unable to report it.' +
          ' For a better experience and to help us fix those kinds of problems in the future,' +
          ' please enable \'reportDjatyCrashes\' option. You may need to refresh the page' +
          ' to enable Djaty again as it\'s just exited to avoid unexpected behaviours';

        Djaty.destroy(errorMessage);

        // eslint-disable-next-line no-console
        console.error(errorMessage);

        return;
      }

      // I disable tracking to avoid reporting unneeded bugs with
      // corrupted state during reporting the original bug.
      Djaty.initApp.destroy();

      const timeline = [];
      loggerTimelineItems.forEach(item => this.logsFormattingCb(item,
        ({ formattedObj }) => this._addItemToTimeline(formattedObj, timeline, 'console')));

      const error = logErrorParams[logErrorParams.length - 1] instanceof Error ?
        logErrorParams[logErrorParams.length - 1] : new Error(logErrorParams[0]);

      const item = {
        err: error,
        msg: error.message,
        time: Date.now(),
        itemType: Djaty.constants.itemType.exception,
      };

      this.exceptionFormattingCb(item,
        ({ formattedObj }) => this._addItemToTimeline(formattedObj, timeline, 'exception'));

      const lastTimelineItem = timeline[timeline.length - 1];

      const payload = Djaty.utils.assign({}, this.constData, {
        agentDataPatch: [{
          timeline,
          shortTitle: lastTimelineItem.shortTitle,
          longTitle: lastTimelineItem.longTitle,
          hash: lastTimelineItem.hash,
          curUrl: window.location.href,
          bugType: lastTimelineItem.itemType,
          customData: [{ clientProjectApiKey: Djaty.config.apiKey }],
        }],
      });

      delete lastTimelineItem.shortTitle;

      const stringifiedPayload = JSON.stringify(payload);
      const url = `${Djaty.config.bugsURL}${Djaty.config.api}${Djaty.config.apiBugsUrl}?reportedAgent=${Djaty.trackingApp.agentId}`;

      Djaty.utils.djatyAjax('POST', url, stringifiedPayload, err => {
        if (err) {
          errorMessage += ' but we are unable to report it due to an internal server problem. You may need' +
            ' to refresh the page to enable Djaty again as it\'s just exited to avoid unexpected behaviours';
        } else {
          errorMessage += ', reported and we are working on it. You may need to refresh the page to' +
            ' enable Djaty again as it\'s just exited to avoid unexpected behaviours';
        }

        Djaty.destroy(errorMessage);

        // eslint-disable-next-line no-console
        console.error(errorMessage);
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Something went wrong with Djaty but we are unable to report it due to an' +
        ' internal problem so it\'ll be very appreciated if you contacted us to report this' +
        ' problem. You may need to refresh the page to enable Djaty again.');
    }
  },

  init(constData, formattingCb, exceptionFormattingCb) {
    if (this.isInitiated) {
      return this;
    }

    this.isInitiated = true;
    this.constData = constData;
    this.logsFormattingCb = formattingCb;
    this.exceptionFormattingCb = exceptionFormattingCb;

    const logTimeline = Djaty.logger.logTimeline;
    const loggedErrors = logTimeline
      .filter(item => item.method === 'error' || item.attrName === 'error');

    if (loggedErrors.length) {
      loggedErrors.forEach(item => {
        const tmpTimeline = logTimeline.slice(0, logTimeline.indexOf(item) + 1);

        this.autoReport(tmpTimeline, item.args);
      });
    }

    Djaty.logger.registerAutoReportCb(this.autoReport.bind(this));

    return this;
  },

  destroy() {
    this.isInitiated = false;
    Djaty.logger.removeAutoReportCb();
  },

  _addItemToTimeline(formattedObj, timeline, type) {
    if (!formattedObj) {
      return;
    }

    formattedObj.itemType = Djaty.constants.itemType[type];
    timeline.push(formattedObj);
  },
};
