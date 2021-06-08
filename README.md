# Djaty Javascript SDK

## Installation
### Fetch djaty-javascript.js directly from Djaty CDN
```html
<script type="text/javascript" src="https://cdn.djaty.com/js-sdk/djaty-javascript.js" djaty-api-key="YOUR_PROJECT_API_KEY_HERE"></script>
```

### Install from NPM
`$ npm install @djaty/djaty-javascript`

```html
<script type="text/javascript" src="/node_modules/@djaty/djaty-javascript/dist/djaty-javascript.js" djaty-api-key="YOUR_PROJECT_API_KEY_HERE"></script>
```

## Usage
- [Official Djaty Javascript SDK Docs](https://djaty.com/docs/SDKs/frontendJs/index.html)

## Quick Start
You can start using Djaty Javascript SDK with [the default configuration](https://djaty.com/docs/SDKs/frontendJs/configuring.html#default-mode)
by just passing the API key by `djaty-api-key` attribute. To set a custom configuration, just pass the config object to `Djaty.init()` method as the following example:

```javascript
  <script type="text/javascript" src="https://cdn.djaty.com/js-sdk/djaty-javascript.js"></script>

  Djaty.init({
    apiKey: 'API_KEY',
    mode: 'full',
    user: {
      // It should be dynamic to get the current user ID for example from memory, cookies, localstorage, or anywhere else.
      userId: 1111,
    },
    tags: ['example_app'],
    stage: Djaty.constants.defaultStages.DEV,
    allowAutoSubmission: true,
    trackingOptions: {
      removeSecretData: false,
      cookies: true,
      localStorage: true,
      ajax: {
        headers: false,
        cookies: true,
        queryParams: true,
      },
      console: {
        excludedMethods : ['profile', 'info'],
        repetitionCount: true,
      },
      navigation: false,
      form: true,
    },
    release: '01.12.01',
    debug: true,
    onBeforeBugSubmission: (djatyBugReport, next) => {
      djatyBugReport.addCustomDataCb(() => 'test custom data');
      next(djatyBugReport);
    },
    ignoreTimelineItem: (item, utils) => {
      utils.console.log('For debugging purpose');
      return item.itemType === 'console' && item.consoleParams[0] === 'Debug';
    },
    ignoredErrors: ['localhost:9000/scripts/tracking/prodMain.js', 'TypeError: Cannot read property "value" of undefined', 'http://localhost:8089'],
  });
```

## Development
### Install dependencies
`$ npm install`

### Serve
`$ npm run serve`

### Build
`$ npm run build`

### Run tests
`$ npm run test`
