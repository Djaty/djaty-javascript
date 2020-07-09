
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(factory);
  } else if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory(require, exports, module);
  } else {
    root.Djaty = factory();
  }
}(this, function(require, exports, module) {

"use strict";function _classCallCheck(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function _possibleConstructorReturn(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!==("undefined"==typeof e?"undefined":_typeof2(e))&&"function"!=typeof e?t:e}function _inherits(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+("undefined"==typeof e?"undefined":_typeof2(e)));t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}function _extendableBuiltin(t){function e(){var e=Reflect.construct(t,Array.from(arguments));return Object.setPrototypeOf(e,Object.getPrototypeOf(this)),e}return e.prototype=Object.create(t.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t,e}function _toConsumableArray(t){if(Array.isArray(t)){for(var e=0,n=Array(t.length);e<t.length;e++)n[e]=t[e];return n}return Array.from(t)}var _typeof2="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},Djaty=window.Djaty;window.Djaty=Djaty=Djaty||{},Djaty.config=Djaty.config||{apiUrl:"https://djaty.com",bugsURL:"https://bugs.djaty.com",cdnPath:"https://cdn.djaty.com",api:"/api",allowAutoSubmission:!0,apiBugsUrl:"/bugs",debug:!1,mode:"default",timelineLimit:30,stackTraceLimit:40,reportDjatyCrashes:!0},Djaty.DjatyError=function(t){function e(t){return _classCallCheck(this,e),_possibleConstructorReturn(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,"[Djaty] "+t))}return _inherits(e,t),e}(_extendableBuiltin(Error));var BACKEND_LIMIT=15e6,PATCH_ITEM_NO=10,SECRET_ITEM_FIELDS=["token","apikey","api_key","creditcard","credit_card","auth","password","secret"],userStructure={types:["object"],required:!1,properties:{userId:{types:["number","string"],required:!1,constrains:{maxLength:255,minLength:2}},logon:{types:["string"],required:!1,constrains:{maxLength:255,minLength:2}}},additionalProperties:!1},onBugSubmitStructure={types:["function"],required:!1};Djaty.constants=Djaty.constants||{elementsForAllRequests:100,elementsPerRequest:PATCH_ITEM_NO,bufferRequestLimit:300,filesURL:"/js-sdk/jsAgentCoreDjaty.js",delayTimePerRequest:2e3,serverDelayTime:18e5,backendLimit:BACKEND_LIMIT,secretItemData:SECRET_ITEM_FIELDS,requestSizeLimit:BACKEND_LIMIT/(2*Djaty.config.timelineLimit*PATCH_ITEM_NO),privacyPlaceHolder:"**HIDDEN**",objectSizeLimit:1e5,titleLimit:250,timelineLimitMax:100,stacktraceLimitMax:100,itemType:{ajax:"ajax",form:"form",navigation:"navigation",exception:"exception",file:"file",console:"console",click:"click"},defaultMode:{removeSecretData:SECRET_ITEM_FIELDS,removeEmail:!0,localStorage:!1,sessionStorage:!1,cookies:!1,hasBackendIntegration:!1,ajax:{queryParams:!1,cookies:!1,headers:!1,requestTime:!1,response:!1,requestPayload:!1},console:{excludedMethods:["profile","count"],repetitionCount:!1},navigation:{title:!0,state:!1},form:!0,file:!0,click:!0,exception:{repetitionCount:!1}},fullMode:{removeSecretData:!1,removeEmail:!1,localStorage:!0,sessionStorage:!0,cookies:!0,hasBackendIntegration:!1,ajax:{queryParams:!0,cookies:!0,headers:!0,requestTime:!0,response:!0,requestPayload:!0},click:!0,console:{repetitionCount:!0},navigation:{title:!0,state:!0},form:!0,file:!0,exception:{repetitionCount:!0}},userStructure:userStructure,onBugSubmitStructure:onBugSubmitStructure,configStructure:{types:["object"],required:!1,additionalProperties:!1,properties:{apiUrl:{types:["string"],required:!1},bugsURL:{types:["string"],required:!1},cdnPath:{types:["string"],required:!1},api:{types:["string"],required:!1},apiBugsUrl:{types:["string"],required:!1},reportURL:{types:["string"],required:!1},stackTraceLimit:{types:["number"],required:!1},timelineLimit:{types:["number"],required:!1},projectId:{types:["string"],required:!1,constrains:{maxLength:255}},namespace:{types:["string"],required:!1,constrains:{maxLength:50,minLength:4}},apiKey:{types:["string"],required:!1,constrains:{maxLength:255,minLength:6}},debug:{types:["boolean"],required:!1},reportDjatyCrashes:{types:["boolean"],required:!1},tags:{types:["array","string"],required:!1,items:{types:["string"],constrains:{maxLength:255,minLength:2,ignoredCharacters:[" ",",","/"]}},constrains:{maxItems:10,uniqueItems:!0}},stage:{types:["string"],required:!1,constrains:{maxLength:255,minLength:1}},allowAutoSubmission:{types:["boolean"],required:!1},mode:{types:["string"],required:!1,allowedValues:["default","full"]},release:{types:["string"],required:!1,constrains:{maxLength:100,minLength:1}},trackingOptions:{types:["object"],required:!1,additionalProperties:!1,properties:{removeSecretData:{types:["boolean","array"],items:{types:["string"]},required:!1},removeEmail:{types:["boolean"],required:!1},click:{types:["boolean"],required:!1},localStorage:{types:["boolean"],required:!1},sessionStorage:{types:["boolean"],required:!1},cookies:{types:["boolean"],required:!1},hasBackendIntegration:{types:["boolean"],required:!1},ajax:{types:["boolean","object"],required:!1,additionalProperties:!1,properties:{queryParams:{types:["boolean"],required:!1},requestPayload:{types:["boolean"],required:!1},headers:{types:["boolean"],required:!1},cookies:{types:["boolean"],required:!1},response:{types:["boolean"],required:!1},requestTime:{types:["boolean"],required:!1}}},console:{types:["boolean","object"],required:!1,additionalProperties:!1,properties:{repetitionCount:{types:["boolean"],required:!1},excludedMethods:{types:["array"],required:!1,items:{types:["string"]}}}},navigation:{types:["boolean","object"],required:!1,additionalProperties:!1,properties:{title:{types:["boolean"],required:!1},state:{types:["boolean"],required:!1}}},form:{types:["boolean"],required:!1},exception:{types:["boolean","object"],additionalProperties:!1,required:!1,properties:{repetitionCount:{types:["boolean"],required:!1}}},file:{types:["boolean"],required:!1}}},user:userStructure,onBeforeBugSubmission:onBugSubmitStructure,ignoreTimelineItem:{types:["function"],required:!1},ignoredErrors:{types:["array"],items:{types:["string"]},required:!1}}},hashType:"sha256",trimmingItemType:"trimming",defaultStages:{PROD:"Prod",STAG:"Stag",DEV:"Dev",TEST:"Test"},elementPathMaxLength:512};var _typeof="function"==typeof Symbol&&"symbol"===_typeof2(Symbol.iterator)?function(t){return"undefined"==typeof t?"undefined":_typeof2(t)}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":"undefined"==typeof t?"undefined":_typeof2(t)},utils=Djaty.utils=Djaty.utils||{originalAddEventListener:null,setOriginalAddEventListener:function(t){this.originalAddEventListener||(this.originalAddEventListener=t)},originalRemoveEventListener:null,setOriginalRemoveEventListener:function(t){this.originalRemoveEventListener||(this.originalRemoveEventListener=t)},forOwn:function(t,e){if(!Djaty.utils.isInstanceOf("Object",t))throw new Error('Make sure you pass "forOwn" obj parameter as an object');if("function"!=typeof e)throw new Error('Make sure you pass "forOwn" cb parameter as a function');var n=Object.prototype.hasOwnProperty;for(var i in t)n.call(t,i)&&e(i,t[i])},isDomElement:function(t){return"object"===("undefined"==typeof HTMLElement?"undefined":_typeof(HTMLElement))?t instanceof HTMLElement:t&&"object"===("undefined"==typeof t?"undefined":_typeof(t))&&null!==t&&1===t.nodeType&&"string"==typeof t.nodeName},getTryCatchHandler:function(t,e,n){if(!utils.originalAddEventListener)throw new Djaty.DjatyError("Can't Set CB handler without originalAddEventListener");return function(){for(var i=arguments.length,r=Array(i),a=0;a<i;a++)r[a]=arguments[a];if(r.forEach(function(e,i){"function"==typeof e&&(r[i]=function(){try{for(var n=arguments.length,i=Array(n),r=0;r<n;r++)i[r]=arguments[r];e.apply(this,i)}catch(a){if(a instanceof Djaty.DjatyError)throw a;var o="function"==typeof e?"the item.toString is "+e.toString():"the item is not a function "+e;Djaty.logger.error("Catch async methods (listeners, .. ) error message for "+("method '"+t+"' is the async callback with type '"+("undefined"==typeof e?"undefined":_typeof(e))+"' still ")+("exists: '"+!!e+"' the item details is "+o),a)}},n&&n(r[i]))}),"addEventListener"===t){var o;return(o=utils.originalAddEventListener).call.apply(o,[e].concat(r))}return e[t].apply(e,r)}},mergeRecursive:function(t,e){for(var n in e)if(e[n]&&e[n].constructor===Object){var i=t[n]?this.mergeRecursive(t[n],e[n]):e[n];t[n]=utils.assign({},t[n],i)}else t[n]=e[n];return t},clone:function(t){if(null===t||void 0===t)return{};if("object"!==("undefined"==typeof t?"undefined":_typeof(t))||"isActiveClone"in t)return t;var e=null;e=t instanceof Date?new t.constructor:t.constructor();for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(t.isActiveClone=null,e[n]=utils.clone(t[n]),delete t.isActiveClone);return e},checkerType:{string:{checker:function(t){return"string"==typeof t},constrains:{maxLength:function(t,e){return t.length<=e},minLength:function(t,e){return t.length>=e},ignoredCharacters:function(t,e){return!e.some(function(e){return t.indexOf(e)!==-1})},isNaN:function(t){function e(e){return t.apply(this,arguments)}return e.toString=function(){return t.toString()},e}(function(t){return!(!t||!isNaN(t))})}},array:{checker:function(t){return Array.isArray(t)},constrains:{maxItems:function(t,e){return t.length<=e},minItems:function(t,e){return t.length>=e},uniqueItems:function(t,e){return!(e&&t.some(function(t,e,n){return!(n.indexOf(t)===e)}))}}},number:{checker:function(t){return"number"==typeof t}},"boolean":{checker:function(t){return"boolean"==typeof t}},object:{checker:function(t){return"[object Object]"===t.toString()}},"function":{checker:function(t){return"function"==typeof t}},isSelectorOrEl:{checker:function(t){var e=void 0;return"string"==typeof t&&(e=document.querySelectorAll(t)),Djaty.utils.isDomElement(t)||e&&e.length}}},validate:function(t,e,n){var i=e.allowedValues;if(e.required&&void 0===n)throw new Djaty.DjatyError("property "+t+" is required");if(void 0!==n){if(e.additionalProperties===!1&&e.properties){var r=Object.keys(n),a=Object.keys(e.properties);if(r.length>a.length||r.some(function(t){return void 0===e.properties[t]}))throw new Djaty.DjatyError(t+" should not have additional properties.")}var o=e.types.some(function(i){"object"===i&&e.properties&&"[object Object]"===n.toString()?utils.forOwn(e.properties,function(t,e){utils.validate(t,e,n[t])}):"array"===i&&e.items&&Array.isArray(n)&&n.forEach(function(n){utils.validate(t,e.items,n)});var r=utils.checkerType[i].checker(n);return utils.checkerType[i].constrains&&r?(utils.forOwn(utils.checkerType[i].constrains,function(r,a){if(e.constrains&&void 0!==e.constrains[r]&&!a(n,e.constrains[r]))throw new Djaty.DjatyError("property '"+t+"' value '"+n+"' for type: '"+i+"' should pass constrain '"+r+"'")}),r):r});if(!o)throw new Djaty.DjatyError("property '"+t+"' should be one of those types: '"+e.types+"'");if(i&&i.indexOf(n)<0)throw new Djaty.DjatyError("'"+t+"' expects value options to be one of "+('"'+i.join(", ")+'"'))}},addEventListenerAndSaveIt:function(t){t.forEach(function(t){var e=utils.getTryCatchHandler("addEventListener",t.node,function(e){t.nodeListeners.push({node:t.node,eventName:t.eventName,cb:e})});e(t.eventName,t.cb)})},nodeListToArr:function(t){if(!Djaty.utils.isInstanceOf("NodeList",t))throw new Error('"nodeListToArr" expects arrAlike parameter to be NodeList');return Array.prototype.slice.call(t)},assign:function(){for(var t=arguments.length,e=Array(t),n=0;n<t;n++)e[n]=arguments[n];if("function"==typeof Object.assign)return Object.assign.apply(Object,e);var i=e[0];if(void 0===i||null===i)throw new TypeError("Cannot convert undefined or null to object");for(var r=Object(i),a=1;a<e.length;a++){var o=e[a];void 0!==o&&null!==o&&this.forOwn(o,function(t,e){r[t]=e})}return r},externalMethodHandler:{ns:"",listeners:{},exposedMethods:{},nodeListeners:[],callMethod:function(t){for(var e=t.split("."),n=arguments.length,i=Array(n>1?n-1:0),r=1;r<n;r++)i[r-1]=arguments[r];var a=i[i.length-1],o={sourceNS:Djaty.utils.externalMethodHandler.ns,targetNS:e[0],method:e[1]+"-"+Date.now()+Math.floor(1e3*Math.random()),type:"call",data:i.slice(0,i.length-1)||[]};window.postMessage(o,"*"),"function"==typeof a&&(Djaty.utils.externalMethodHandler.listeners[o.method]=a)},handleMethodResp:function(t){var e=t.sourceNS,n=t.method,i=t.type,r=t.data;if(e&&i&&e===Djaty.utils.externalMethodHandler.ns&&"resp"===i&&Djaty.utils.externalMethodHandler.listeners[n]){var a;(a=Djaty.utils.externalMethodHandler.listeners)[n].apply(a,_toConsumableArray(r)),delete Djaty.utils.externalMethodHandler.listeners[n]}},handleMethodCall:function(t){var e,n=t.data||[];n.push(function(){for(var e=arguments.length,n=Array(e),i=0;i<e;i++)n[i]=arguments[i];t.type="resp",t.data=n,window.postMessage(t,"*")}),(e=Djaty.utils.externalMethodHandler.exposedMethods)[t.method.split("-")[0]].apply(e,_toConsumableArray(n))},addExposedMethods:function(t){Djaty.utils.externalMethodHandler.exposedMethods=Djaty.utils.assign({},Djaty.utils.externalMethodHandler.exposedMethods,t)},listenCallResp:function(t){var e=t.data;!(e&&e.targetNS&&e.sourceNS)||e.sourceNS===Djaty.utils.externalMethodHandler.ns&&"call"===e.type||e.targetNS===Djaty.utils.externalMethodHandler.ns&&"resp"===e.type||(e.sourceNS===Djaty.utils.externalMethodHandler.ns&&"resp"===e.type&&Djaty.utils.externalMethodHandler.handleMethodResp(e),e.targetNS===Djaty.utils.externalMethodHandler.ns&&"call"===e.type&&Djaty.utils.externalMethodHandler.handleMethodCall(e))},init:function(t){Djaty.utils.externalMethodHandler.ns=t,Djaty.utils.addEventListenerAndSaveIt([{nodeListeners:Djaty.utils.externalMethodHandler.nodeListeners,node:window,eventName:"message",cb:Djaty.utils.externalMethodHandler.listenCallResp}])},destroy:function(){this.nodeListeners.forEach(function(t){utils.originalRemoveEventListener.call(t.node,t.eventName,t.cb)}),Djaty.utils.externalMethodHandler.ns="",Djaty.utils.externalMethodHandler.listeners={},this.nodeListeners=[]}},isInstanceOf:function(t,e){return e.constructor.name===t||!!e.__proto__&&this.isInstanceOf(t,e.__proto__)}};Djaty.logger=Djaty.logger||{logTimeline:[],consoleWrappedMethods:["log","dir","error","warn","info"],isInitialized:!1,_autoReportCb:null,init:function(t){var e=this;this.isInitialized||(this.isInitialized=!0,this.consoleWrappedMethods.forEach(function(n){e[n]=function(){for(var i=arguments.length,r=Array(i),a=0;a<i;a++)r[a]=arguments[a];e.logTimeline.length>100&&e.logTimeline.shift(),e.logTimeline.push({attrName:n,args:r}),e._autoReportCb&&"error"===n&&e._autoReportCb(e.logTimeline.slice(),r),(Djaty.config.debug||"error"===n)&&(r[0]&&"string"==typeof r[0]?r[0]="Djaty@"+Djaty.version+": "+r[0]:r.unshift("Djaty@"+Djaty.version),t[n].apply(t,r))}}))},registerAutoReportCb:function(t){this._autoReportCb=t},removeAutoReportCb:function(){this._autoReportCb=null}},function(){if(window.Djaty.initApp)return void window.Djaty.initApp.handleInitFromApiKeyAttr();Djaty.initApp=Djaty.initApp||{landingURL:window.location.href,timeline:[],onTrackingCoreCb:null,trackers:{},isInitiated:!1,originalMethods:{},onSubmitHandlers:[],nodeListeners:[],extConfig:null,initialFormData:[],ignoredErrors:[],ignoreTimelineItem:null,globalCustomData:[],init:function(t){var e=this,n=t.config,i=t.afterDjatyJSLoadCb,r=t.isAlreadyLoaded,a=void 0!==r&&r,o=t.isControlledByDjatyExt,s=void 0!==o&&o;try{if("loading"!==document.readyState){var c=document.createElement("iframe");c.src=window.location.href,document.body.appendChild(c),Djaty.utils.setOriginalAddEventListener(c.contentDocument.addEventListener),Djaty.utils.setOriginalRemoveEventListener(c.contentDocument.removeEventListener),Djaty.logger.init(utils.assign({},c.contentWindow.console)),document.body.removeChild(c)}else Djaty.utils.setOriginalAddEventListener(Node.prototype.addEventListener),Djaty.utils.setOriginalRemoveEventListener(Node.prototype.removeEventListener),Djaty.logger.init(utils.assign({},window.console));Djaty.utils.externalMethodHandler.init("djatyInitApp"),!Djaty.initApp.isExtension&&s&&(Djaty.initApp.isExtension=!0),Djaty.initApp.isInitiated||utils.addEventListenerAndSaveIt([{nodeListeners:this.nodeListeners,node:document,eventName:"DOMContentLoaded",cb:function(){e._loadCoreLib(i)}}]);var d=Djaty.initApp.jsFrontendConfig;if(s||d||("undefined"==typeof n.allowAutoSubmission&&(n.allowAutoSubmission=!0),d=n),Djaty.initApp.jsFrontendConfig&&Djaty.initApp.isInitiated&&!s)return void console.warn("Init djaty javascript SDK multiple time is ignored, Please unify init in one way, note: setting djaty-api-key attribute consider initialize");var l=utils.clone(n);if(Djaty.initApp.isInitiated){var u=d||Djaty.initApp.extConfig||n||Djaty.config;l=utils.clone(u)}try{utils.validate("Configuration",Djaty.constants.configStructure,l)}catch(p){throw Djaty.utils.externalMethodHandler.callMethod("djatyExt.showNotification",{level:"warning",message:"Invalid djaty-js-sdk configuration. So, Djaty default configuration is now applied."},function(){}),p}d&&(Djaty.initApp.jsFrontendConfig=d),Djaty.initApp._handleConfigLimits(l),Djaty.config.trackingOptions="full"===l.mode?utils.clone(Djaty.constants.fullMode):utils.clone(Djaty.constants.defaultMode);var y=l.trackingOptions&&l.trackingOptions.removeSecretData;if(Array.isArray(y)||y===!1?Djaty.config.trackingOptions.removeSecretData=y:y===!0&&(Djaty.config.trackingOptions.removeSecretData=Djaty.constants.secretItemData),l.trackingOptions&&delete l.trackingOptions.removeSecretData,l.onBeforeBugSubmission&&(Djaty.initApp._addBeforeBugSubmissionCb(l.onBeforeBugSubmission),delete l.onBeforeBugSubmission),l.ignoredErrors&&(Djaty.initApp.ignoredErrors=l.ignoredErrors,delete l.ignoredErrors),l.ignoreTimelineItem&&(Djaty.initApp.ignoreTimelineItem=l.ignoreTimelineItem,delete l.ignoreTimelineItem),l.trackingOptions&&Djaty.utils.forOwn(l.trackingOptions,function(t,e){var n=["ajax","exception","navigation","console"];e===!0&&n.indexOf(t)!==-1&&delete l.trackingOptions[t]}),Djaty.config=utils.mergeRecursive(Djaty.config,l),a?this._loadCoreLib(i):"loading"!==document.readyState&&this._loadCoreLib(i),this.isInitiated)return;this.isInitiated=!0,this.timeline.unshift({url:window.location.href,ev:{type:"pushstate",state:null,title:document.title},time:Date.now(),itemType:Djaty.constants.itemType.navigation}),utils.forOwn(this.trackers,function(t,n){Djaty.config.trackingOptions[t]&&n.init(e.onTrackingCb)})}catch(f){if(f instanceof Djaty.DjatyError)throw f;Djaty.logger.error("Catch error in init initApp",f)}},destroy:function(){this.isInitiated&&(Djaty.logger.log("Destroy initApp"),utils.forOwn(Djaty.initApp.trackers,function(t,e){e.destroy()}),this.nodeListeners.forEach(function(t){Djaty.utils.originalRemoveEventListener.call(t.node,t.eventName,t.cb)}),this.timeline=[],this.isInitiated=!1,this.onSubmitHandlers=[],this.nodeListeners=[],this.afterLoadDjatyCb=null)},addInFrontOfSubmitHandler:function(t){utils.validate("addInFrontOfSubmitHandler",Djaty.constants.onBugSubmitStructure,t),this.onSubmitHandlers.unshift(t)},addTracker:function(t,e){this.trackers[t]||(this.trackers[t]=e)},regCoreTrackingCb:function(t){Djaty.initApp.onTrackingCoreCb=t},regExtConfig:function(t){Djaty.initApp.extConfig=t},regAfterLoadDjaty:function(t){Djaty.initApp.afterLoadDjatyCb=t},onTrackingCb:function(t){return Djaty.initApp.onTrackingCoreCb?Djaty.initApp.onTrackingCoreCb(t):Djaty.initApp.timeline.push(t)},_loadCoreLib:function(t){function e(t,e){if(Djaty.initApp.isInitiated){Djaty.logger.info("Error in loading djaty core",t,e);var n=e||'Refused to connect to Djaty. It is most likely a Content Security           Policy (CSP) or a connectivity problem. To solve this issue see <a target="_blank" href="'+Djaty.config.apiUrl+'/docs/SDKs/frontendJs/troubleshooting.html#use-djaty-javascript-sdk-with-a-content-security-policy">Troubleshooting</a>';return Djaty.logger.error("Can't load (Djaty core)",n,t),Djaty.initApp.isExtension?void Djaty.utils.externalMethodHandler.callMethod("djatyExt.onLoadFailure",function(){Djaty.logger.info("Reset successfully."),Djaty.utils.externalMethodHandler.callMethod("djatyExt.notify",n,function(){Djaty.logger.info("Extension notification had been sent."),Djaty.initApp.destroy()})}):void Djaty.initApp.destroy()}}var n=new XMLHttpRequest;n.onerror=e,n.onreadystatechange=function(){if(4===n.readyState){if(200!==n.status){var i="Unable to load Djaty as we are maintaining our servers now. Please try again after few minutes.";return void e(n.response,i)}var r=document.querySelector("script[djaty-app]");if(t&&t(),!r){var a=document.createElement("script");a.type="text/javascript",a.innerHTML=n.responseText,a.setAttribute("djaty-app",""),a.setAttribute("async",""),a.classList.add("djaty-app"),document.head.appendChild(a),t||Djaty.trackingApp.init()}}};try{n.open("GET",Djaty.config.cdnPath+Djaty.constants.filesURL,!0),n.send()}catch(i){if(Djaty.logger.error("Catch CORS error during loading djaty core tracking file",i),i.message.indexOf("Content Security Policy")!==-1)return void e(i.name+': Refused to connect to Djaty. It is most likely a Content Security             Policy (CSP) or a connectivity problem. To solve this issue see             <a target="_blank" href="'+Djaty.config.apiUrl+'/docs/SDKs/frontendJs/troubleshooting.html#use-djaty-javascript-sdk-with-a-content-security-policy">Troubleshooting</a>');e(i.name+": "+i.message)}},_attachInitNodeListenersToOurEvents:function(t){t.forEach(function(e,n){t[n].nodeListeners=Djaty.initApp.nodeListeners}),utils.addEventListenerAndSaveIt(t)},handleInitFromApiKeyAttr:function(){var t=document.querySelector("script[djaty-api-key]");t&&Djaty.init({apiKey:t.getAttribute("djaty-api-key")})},_handleConfigLimits:function(t){var e=["stacktraceLimit","timelineLimit"];e.forEach(function(e){var n=Djaty.constants[e+"Max"];!t[e]||t[e]<n||(console.warn("You can't exceed limit for "+e+" so we will use our max limit: "+("("+n+")")),t[e]=n)})},_addBeforeBugSubmissionCb:function(t){utils.validate("beforeBugSubmissionCb",Djaty.constants.onBugSubmitStructure,t),Djaty.initApp.onSubmitHandlers.push(t)}},Djaty.init=function(t){Djaty.initApp.init({config:t}),Djaty.pcApp&&Djaty.pcApp.init(),Djaty.trackingApp&&Djaty.trackingApp.init({})},Djaty.trackBug=function(t){if(!Djaty.initApp.isInitiated)return console.warn("Djaty not initiated, Please initialize Djaty before use this method"),void console.error(t);if(!(t instanceof Error))return void Djaty.initApp.originalMethods.trackConsole.error("Djaty.trackBug accept only Error objects");var e=Date.now(),n={err:t,msg:t.message,time:e,itemType:Djaty.constants.itemType.exception};Djaty.initApp.trackers.exception.onTrackingCb(n)},Djaty.destroy=function(t){try{Djaty.initApp.isInitiated&&Djaty.initApp.destroy(),Djaty.trackingApp&&Djaty.trackingApp.isInitiated&&Djaty.trackingApp.destroy(),Djaty.pcApp&&Djaty.pcApp.destroy(t)}catch(e){Djaty.logger.error("Catch djaty.destroy",e)}},Djaty.setUser=function(t){return Djaty.initApp.isInitiated?(Djaty.utils.validate("setUser",Djaty.constants.userStructure,t),void(Djaty.config.user=t)):void console.warn("Djaty not initiated, Please initialize Djaty before use this method")},Djaty.addGlobalCustomData=function(t){Djaty.initApp.globalCustomData.push(t)};var t={onTrackingCb:null,isInitiated:!1,init:function(e){this.isInitiated||(this.isInitiated=!0,this.onTrackingCb=e,Djaty.initApp._attachInitNodeListenersToOurEvents([{node:document,eventName:"click",cb:function(e){t.handleClickEvent(e)}}]))},handleClickEvent:function(e){var n=Date.now(),i={itemType:Djaty.constants.itemType.click,ev:e,time:n};t.onTrackingCb(i)},destroy:function(){this.isInitiated&&(this.isInitiated=!1)}};Djaty.initApp.addTracker(Djaty.constants.itemType.click,t);var e={onTrackingCb:null,isInitiated:!1,init:function(t){this.isInitiated||(this.isInitiated=!0,this.onTrackingCb=t,Djaty.initApp.originalMethods.trackPushStateNavigation=window.history.pushState,Djaty.initApp.originalMethods.trackReplaceStateNavigation=window.history.replaceState,window.history.pushState=this._wrapMethod(Djaty.initApp.originalMethods.trackPushStateNavigation,"pushstate"),window.history.replaceState=this._wrapMethod(Djaty.initApp.originalMethods.trackReplaceStateNavigation,"replacestate"),Djaty.initApp._attachInitNodeListenersToOurEvents([{node:window,eventName:"popstate",cb:this._handleNavigation}]))},destroy:function(){this.isInitiated&&(this.isInitiated=!1,window.history.pushState=Djaty.initApp.originalMethods.trackPushStateNavigation,window.history.replaceState=Djaty.initApp.originalMethods.trackReplaceStateNavigation)},_wrapMethod:function(t,n){return function(){try{for(var i=arguments.length,r=Array(i),a=0;a<i;a++)r[a]=arguments[a];var o=t.apply(this,r),s={type:n,state:r[0]};return e._handleNavigation(s),o}catch(c){return Djaty.logger.error("Catch navigator tracker '"+n+"' wrapper",c)}}},_handleNavigation:function(t){var n=Date.now(),i={itemType:Djaty.constants.itemType.navigation,ev:t,url:window.location.href,time:n};e.onTrackingCb(i)}};Djaty.initApp.addTracker(Djaty.constants.itemType.navigation,e);var n={onTrackingCb:null,requestDetails:{},isInitiated:!1,init:function(t){this.isInitiated||(this.isInitiated=!0,this.onTrackingCb=t,utils.assign(Djaty.initApp.originalMethods,{trackOpenAjax:window.XMLHttpRequest.prototype.open,trackSendAjax:window.XMLHttpRequest.prototype.send,setHeadWrap:window.XMLHttpRequest.prototype.setRequestHeader,abortWrapper:window.XMLHttpRequest.prototype.abort}),utils.assign(window.XMLHttpRequest.prototype,{open:this._wrapReqOpen(window.XMLHttpRequest.prototype.open),setRequestHeader:this._wrapSetReqHeader(window.XMLHttpRequest.prototype.setRequestHeader),send:this._wrapReqSend(window.XMLHttpRequest.prototype.send),abort:this._wrapAbort(window.XMLHttpRequest.prototype.abort)}))},destroy:function(){this.isInitiated&&(utils.assign(window.XMLHttpRequest.prototype,{open:window.XMLHttpRequest.prototype.open,setRequestHeader:window.XMLHttpRequest.prototype.setRequestHeader,send:window.XMLHttpRequest.prototype.send,abort:window.XMLHttpRequest.prototype.abort}),this.isInitiated=!1)},_wrapReqOpen:function(t){if("function"!=typeof t)throw new Error("_wrapReqOpen only accepts 'originalFn' as a function");return function(){for(var e=arguments.length,n=Array(e),i=0;i<e;i++)n[i]=arguments[i];var r=(new Date).getTime(),a=window.location.host,o=1e7*Math.random(),s=""+r+o+"_"+a+(Djaty.initApp.isExtension?"_extension":"");return Djaty.config.trackingOptions.hasBackendIntegration&&(n[1]+=n[1].match(/\?/)?"&":"?",n[1]+="djatyReqId="+s),this.__djaty={openParams:n,reqStart:r,reqId:s,requestHeaders:[]},t.apply(this,n)}},_wrapSetReqHeader:function(t){if("function"!=typeof t)throw new Error("_wrapReqOpen only accepts 'originalFn' as a function");return function(){for(var e=arguments.length,n=Array(e),i=0;i<e;i++)n[i]=arguments[i];var r=t.apply(this,n);if(Djaty.initApp.trackers.ajax._isDjatyAjax(this.__djaty.openParams[1],this.__djaty.requestHeaders))return r;try{var a=this.__djaty.requestHeaders.find(function(t){return t.name===n[0]});a?a.value=JSON.stringify(n[1]):this.__djaty.requestHeaders.push({name:n[0],value:JSON.stringify(n[1])})}catch(o){Djaty.logger.error("Catch wrapping setRequestHeader method with error ",o)}return r}},_wrapReqSend:function(t){if("function"!=typeof t)throw new Error("_wrapReqOpen only accepts 'originalFn' as a function");var e=document.cookie;return function(){for(var i=this,r=arguments.length,a=Array(r),o=0;o<r;o++)a[o]=arguments[o];try{if(Djaty.initApp.trackers.ajax._isDjatyAjax(this.__djaty.openParams[1],this.__djaty.requestHeaders))return t.apply(this,a);n.requestDetails={reqArgs:this.__djaty.openParams,isAborted:this.__djaty.isAborted,requestPayload:a[0],reqId:this.__djaty.reqId,ajaxCookie:e,state:"pending",headers:{requestHeaders:this.__djaty.requestHeaders}},n._ajaxHandler.call(this,n.requestDetails),Djaty.initApp._attachInitNodeListenersToOurEvents([{node:this,eventName:"readystatechange",cb:function(t){if(4===i.readyState){var e=i.getAllResponseHeaders(),r=Date.now(),a=r-i.__djaty.reqStart;n.requestDetails={ev:t,reqArgs:i.__djaty.openParams,isAborted:i.__djaty.isAborted,reqId:i.__djaty.reqId,requestTime:a,state:"finished",headers:{responseHeaders:e,requestHeaders:i.__djaty.requestHeaders}},n._ajaxHandler.call(i,n.requestDetails)}}}])}catch(s){Djaty.logger.error("Catch Ajax tracker error message ",s)}return t.apply(this,a)}},_wrapAbort:function(t){if("function"!=typeof t)throw new Error("_wrapAbort only accepts 'originalFn' as a function");return function(){this.__djaty.isAborted=!0;for(var e=arguments.length,n=Array(e),i=0;i<e;i++)n[i]=arguments[i];return t.apply(this,n)}},_ajaxHandler:function(t){var e=t.ev,i=t.reqArgs,r=t.isAborted,a=t.requestPayload,o=t.reqId,s=t.state,c=t.requestTime,d=t.ajaxCookie,l=t.headers;if(!(e instanceof Event&&"readystatechange"===e.type)&&"pending"!==s)throw new Error("_ajaxHandler only accept events of type 'readystatechange'");if(!Array.isArray(i))throw new Error('Make sure you pass "reqArgs" parameter as an array');var u=Date.now(),p={ev:e,reqArgs:i,requestPayload:a,isAborted:r,time:u,requestTime:c,itemType:Djaty.constants.itemType.ajax,reqId:o,ajaxCookie:d,headers:l,state:s};n.onTrackingCb(p)},_isDjatyAjax:function(t,e){var n=(""+Djaty.config.bugsURL+Djaty.config.api+Djaty.config.apiBugsUrl).replace(/\//g,"\\/").replace(/\./g,"\\."),i=Djaty.config.cdnPath.replace(/\//g,"\\/").replace(/\./g,"\\."),r=new RegExp("^("+n+"|"+i+").*","gi");return t.match(r)||e["current-domain"]}};Djaty.initApp.addTracker(Djaty.constants.itemType.ajax,n);var i={onTrackingCb:null,isInitiated:!1,init:function(t){var e=this;if(!this.isInitiated){this.isInitiated=!0,this.onTrackingCb=t,Djaty.initApp.originalMethods.trackConsole=utils.assign({},window.console);var n=window.console;utils.forOwn(n,function(t,i){"function"!=typeof i||Djaty.config.trackingOptions.console.excludedMethods&&void 0!==Djaty.config.trackingOptions.console.excludedMethods.find(function(e){return e===t})||(n[t]=e._wrapMethod(t,i))}),window.console=n}},destroy:function(){this.isInitiated&&(this.isInitiated=!1,window.console=Djaty.initApp.originalMethods.trackConsole||window.console)},_wrapMethod:function(t,e){if("string"!=typeof t)throw new Error('Make sure you pass "attrName" parameter as a string');if("function"!=typeof e)throw new Error("_wrapMethod only accepts 'originalFn' as a function");return function(){try{for(var n=arguments.length,r=Array(n),a=0;a<n;a++)r[a]=arguments[a];var o=e.apply(this,r);return i._consoleHandler(t,r),o}catch(s){return Djaty.logger.error("Catch console error",s)}}},_consoleHandler:function(t,e){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:Date.now();if("string"!=typeof t)throw new Error('Make sure you pass "attrName" parameter as a string');if(!Array.isArray(e))throw new Error('Make sure you pass "args" parameter as an array');if("Djaty"===e[0])return e.splice(0,1);var i={attrName:t,args:e,time:n,itemType:Djaty.constants.itemType.console};return this.onTrackingCb(i)}};Djaty.initApp.addTracker(Djaty.constants.itemType.console,i);var r={onTrackingCb:null,isInitiated:!1,init:function(t){this.isInitiated||(this.isInitiated=!0,this.onTrackingCb=t,Djaty.initApp._attachInitNodeListenersToOurEvents([{node:window,eventName:"error",cb:r._errHandler}]))},destroy:function(){this.isInitiated&&(this.isInitiated=!1)},_errHandler:function(t){if(!(t instanceof Event&&"error"===t.type))throw new Error("_errHandler only accept events of type 'error'");var e=Date.now(),n={err:t.error,msg:t.message,time:e,itemType:Djaty.constants.itemType.exception};r.onTrackingCb(n)}};Djaty.initApp.addTracker(Djaty.constants.itemType.exception,r);
var a={onTrackingCb:null,init:function(t){function e(t,e){function n(){Djaty.initApp.trackers.file._fileHandler(t,e.target,"error")}Djaty.initApp._attachInitNodeListenersToOurEvents([{node:t,eventName:"error",cb:n}])}function n(t){if(utils.isDomElement(t)){var n=utils.nodeListToArr(t.querySelectorAll(r.join(", ")));n.push(t),n.forEach(function(t){var n=t.nodeName.toLowerCase(),r=i[n];r&&t[r.target]&&!t.hasAttribute("djaty-app")&&!t.hasAttribute("__djaty_file_already_tracked")&&e(t,r)})}}this.onTrackingCb=t;var i={img:{target:"src"},input:{target:"src"},link:{target:"href"},script:{target:"src"},audio:{target:"src"},video:{target:"src"},source:{target:"src"},track:{target:"src"}},r=Object.keys(i),a={childList:!0,subtree:!0},o=document.querySelectorAll(r.join(", "));utils.nodeListToArr(o).forEach(function(t){var n=t.nodeName.toLowerCase(),r=i[n];r&&t[r.target]&&!t.hasAttribute("djaty-app")&&!t.hasAttribute("__djaty_file_already_tracked")&&e(t,r)}),Djaty.initApp.originalMethods.trackFiles=new MutationObserver(function(t){try{t.forEach(function(t){utils.nodeListToArr(t.addedNodes).forEach(function(t){n(t)})})}catch(e){Djaty.logger.error("Catch in mutations observer",e)}}),Djaty.initApp.originalMethods.trackFiles.observe(document,a)},destroy:function(){Djaty.initApp.originalMethods.trackFiles&&Djaty.initApp.originalMethods.trackFiles.disconnect()},_fileHandler:function(t,e,n){if("string"!=typeof e||"string"!=typeof n)throw new Error('Make sure you pass "_fileHandler" parameters correctly');if(!utils.isDomElement(t))throw new Error('Make sure you pass "node" parameter as DOM element');if(!t.hasAttribute("__djaty_file_already_tracked")){t.setAttribute("__djaty_file_already_tracked","");var i=Date.now(),r={node:t,target:e,ev:n,time:i,itemType:Djaty.constants.itemType.file};this.onTrackingCb(r)}}};Djaty.initApp.addTracker(Djaty.constants.itemType.file,a);var o={onTrackingCb:null,isInitiated:!1,init:function(t){function e(t){var n=t,i=t.nodeName.toLowerCase(),r=t.className&&t.className.match&&t.className.match("djaty-no-track");if(!r)return"form"!==i?void t.childNodes.forEach(function(t){e(t)}):void Djaty.initApp._attachInitNodeListenersToOurEvents([{node:n,eventName:"submit",cb:o._onFormSubmit}])}if(!this.isInitiated){this.isInitiated=!0,this.onTrackingCb=t;var n={childList:!0,subtree:!0},i=document.querySelectorAll("form");utils.nodeListToArr(i).forEach(function(t){e(t)}),Djaty.initApp.originalMethods.trackForm=new MutationObserver(function(t){try{t.forEach(function(t){utils.nodeListToArr(t.addedNodes).forEach(function(t){e(t)})})}catch(n){Djaty.logger.error("Catch in mutations observer",n)}}),Djaty.initApp.originalMethods.trackForm.observe(document,n)}},destroy:function(){this.isInitiated&&(this.isInitiated=!1,Djaty.initApp.originalMethods.trackForm&&Djaty.initApp.originalMethods.trackForm.disconnect())},_onFormSubmit:function(t){if(!Djaty.utils.isInstanceOf("Event",t)||"submit"!==t.type)throw new Error("_onFormSubmit only accept events of type 'submit'");var e=Date.now(),n={ev:t,time:e,itemType:Djaty.constants.itemType.form};o.onTrackingCb(n)}};Djaty.initApp.addTracker(Djaty.constants.itemType.form,o),Djaty.addSubmitHandler=function(t){return Djaty.initApp.isInitiated?void Djaty.initApp._addBeforeBugSubmissionCb(t):void console.warn("Djaty not initiated, Please initialize Djaty before use this method")},Djaty.version="1.0.0",Djaty.initApp.handleInitFromApiKeyAttr()}();;
return Djaty;

}));

//# sourceMappingURL=djaty-javascript.js.map
