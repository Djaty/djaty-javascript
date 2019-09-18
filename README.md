# Djaty
Javascript tracking agent for frontend.

### Build:
``` bash
npm run build
```

### Serve:
``` bash
npm run serve
```

### Configuration

```html
<script type="text/javascript" src="https://djaty.com/assets/djaty-javascript.js" djaty-init-app></script>

```
```javascript

  Djaty.init({
    projectId: 'djaty',
    debug: true,
    tags: ['tag1', 'tag2'],
    stages: ['prod'],
    automaticSubmission: true,
    mode: 'default',
    namespace: 'mouneer',
    modeOption: {
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
         title: false,
         state: false,
       },   
       form: true,   
       files: true,   
       exception: {
         repetitionCount: false,
       },
     },
    onSubmitFilter: (data, next) => {
      next(data);
  }
 });
```
