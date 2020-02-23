/**
 * Constants file
 *
 * */
const BACKEND_LIMIT = 15 * 1000 * 1000;
const PATCH_ITEM_NO = 10;
const SECRET_ITEM_FIELDS = ['token', 'apikey', 'api_key', 'creditcard', 'credit_card', 'auth', 'password', 'secret'];
const userStructure = {
  types: ['object'],
  required: false,
  properties: {
    userId: {
      types: ['number', 'string'],
      required: false,
      constrains: {
        maxLength: 255,
        minLength: 2,
      },
    },
    logon: {
      types: ['string'],
      required: false,
      constrains: {
        maxLength: 255,
        minLength: 2,
      },
    },
  },
  additionalProperties: false,
};

const onBugSubmitStructure = {
  types: ['function'],
  required: false,
};

Djaty.constants = Djaty.constants || {
  elementsForAllRequests: 1e2,
  elementsPerRequest: PATCH_ITEM_NO,
  bufferRequestLimit: 300,
  filesURL: '/js-sdk/jsAgentCoreDjaty.js',
  delayTimePerRequest: 2e3,
  serverDelayTime: 30 * 60 * 1000,
  backendLimit: BACKEND_LIMIT,
  secretItemData: SECRET_ITEM_FIELDS,
  requestSizeLimit: (BACKEND_LIMIT / (2 * Djaty.config.timelineLimit * PATCH_ITEM_NO)),
  privacyPlaceHolder: '**HIDDEN**',
  objectSizeLimit: 1000 * 100,
  titleLimit: 250,
  timelineLimitMax: 100,
  stacktraceLimitMax: 100,
  itemType: {
    ajax: 'ajax',
    form: 'form',
    navigation: 'navigation',
    exception: 'exception',
    file: 'file',
    console: 'console',
    click: 'click',
  },
  defaultMode: {
    removeSecretData: SECRET_ITEM_FIELDS,
    removeEmail: true,
    localStorage: false,
    sessionStorage: false,
    cookies: false,
    ajax: {
      queryParams: false,
      cookies: false,
      headers: false,
      requestTime: false,
      response: false,
      requestPayload: false,
    },

    console: {
      excludedMethods: ['profile', 'count'],
      repetitionCount: false,
    },

    navigation: {
      title: true,
      state: false,
    },

    form: true,

    file: true,

    click: true,
    exception: {
      repetitionCount: false,
    },
  },
  fullMode: {
    removeSecretData: false,
    removeEmail: false,
    localStorage: true,
    sessionStorage: true,
    cookies: true,
    ajax: {
      queryParams: true,
      cookies: true,
      headers: true,
      requestTime: true,
      response: true,
      requestPayload: true,
    },
    click: true,

    console: {
      repetitionCount: true,
    },

    navigation: {
      title: true,
      state: true,
    },

    form: true,
    file: true,
    exception: {
      repetitionCount: true,
    },
  },
  userStructure,
  onBugSubmitStructure,
  configStructure: {
    types: ['object'],
    required: false,
    additionalProperties: false,
    properties: {
      apiUrl: {
        types: ['string'],
        required: false,
      },
      bugsURL: {
        types: ['string'],
        required: false,
      },
      cdnPath: {
        types: ['string'],
        required: false,
      },
      api: {
        types: ['string'],
        required: false,
      },
      apiBugsUrl: {
        types: ['string'],
        required: false,
      },
      reportURL: {
        types: ['string'],
        required: false,
      },
      stackTraceLimit: {
        types: ['number'],
        required: false,
      },
      timelineLimit: {
        types: ['number'],
        required: false,
      },
      projectId: {
        types: ['string'],
        required: false,
        constrains: {
          maxLength: 255,
        },
      },
      namespace: {
        types: ['string'],
        required: false,
        constrains: {
          maxLength: 50,
          minLength: 4,
        },
      },
      apiKey: {
        types: ['string'],
        required: false,
        constrains: {
          maxLength: 255,
          minLength: 6,
        },
      },
      debug: {
        types: ['boolean'],
        required: false,
      },
      reportDjatyCrashes: {
        types: ['boolean'],
        required: false,
      },
      tags: {
        types: ['array', 'string'],
        required: false,
        items: {
          types: ['string'],
          constrains: {
            maxLength: 255,
            minLength: 2,
            ignoredCharacters: [' ', ',', '/'],
          },
        },
        constrains: {
          maxItems: 10,
          uniqueItems: true,
        },
      },
      stage: {
        types: ['string'],
        required: false,
        constrains: {
          maxLength: 255,
          minLength: 1,
        },
      },
      allowAutoSubmission: {
        types: ['boolean'],
        required: false,
      },
      mode: {
        types: ['string'],
        required: false,
        allowedValues: ['default', 'full'],
      },
      release: {
        types: ['string'],
        required: false,
        constrains: {
          maxLength: 100,
          minLength: 1,
        },
      },
      trackingOptions: {
        types: ['object'],
        required: false,
        additionalProperties: false,
        properties: {
          removeSecretData: {
            types: ['boolean', 'array'],
            items: {
              types: ['string'],
            },
            required: false,
          },
          removeEmail: {
            types: ['boolean'],
            required: false,
          },
          click: {
            types: ['boolean'],
            required: false,
          },
          localStorage: {
            types: ['boolean'],
            required: false,
          },
          sessionStorage: {
            types: ['boolean'],
            required: false,
          },
          cookies: {
            types: ['boolean'],
            required: false,
          },
          ajax: {
            types: ['boolean', 'object'],
            required: false,
            additionalProperties: false,
            properties: {
              queryParams: {
                types: ['boolean'],
                required: false,
              },
              requestPayload: {
                types: ['boolean'],
                required: false,
              },
              headers: {
                types: ['boolean'],
                required: false,
              },
              cookies: {
                types: ['boolean'],
                required: false,
              },
              response: {
                types: ['boolean'],
                required: false,
              },
              requestTime: {
                types: ['boolean'],
                required: false,
              },
            },
          },
          console: {
            types: ['boolean', 'object'],
            required: false,
            additionalProperties: false,
            properties: {
              repetitionCount: {
                types: ['boolean'],
                required: false,
              },
              excludedMethods: {
                types: ['array'],
                required: false,
                items: {
                  types: ['string'],
                },
              },
            },
          },
          navigation: {
            types: ['boolean', 'object'],
            required: false,
            additionalProperties: false,
            properties: {
              title: {
                types: ['boolean'],
                required: false,
              },
              state: {
                types: ['boolean'],
                required: false,
              },
            },
          },
          form: {
            types: ['boolean'],
            required: false,
          },
          exception: {
            types: ['boolean', 'object'],
            additionalProperties: false,
            required: false,
            properties: {
              repetitionCount: {
                types: ['boolean'],
                required: false,
              },
            },
          },
          file: {
            types: ['boolean'],
            required: false,
          },
        },
      },
      user: userStructure,
      onBeforeBugSubmission: onBugSubmitStructure,
      ignoreTimelineItem: {
        types: ['function'],
        required: false,
      },
      ignoredErrors: {
        types: ['array'],
        items: {
          types: ['string'],
        },
        required: false,
      },
    },
  },
  hashType: 'sha256',
  trimmingItemType: 'trimming',
  defaultStages: {
    PROD: 'Prod',
    STAG: 'Stag',
    DEV: 'Dev',
    TEST: 'Test',
  },
  elementPathMaxLength: 512,
};
