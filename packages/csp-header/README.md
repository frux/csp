# csp-header
[![NPM version](https://img.shields.io/npm/v/csp-header.svg?style=flat)](https://www.npmjs.com/package/csp-header)
[![NPM downloads](https://img.shields.io/npm/dm/csp-header.svg?style=flat)](https://www.npmjs.com/package/csp-header)
[![Dependency Status](https://img.shields.io/david/frux/csp-header.svg?style=flat)](https://david-dm.org/frux/csp-header)

Content-Security-Policy header generator for Node.js.

## Install
```bash
npm install --save csp-header
```

## Usage
```js
const { getCSP, nonce, EVAL, INLINE, SELF } = require('csp-header');

getCSP({
    directives: {
        'script-src': [
            SELF,
            INLINE,
            EVAL,
            nonce('gg3g43#$g32gqewgaAEGeag2@#GFQ#g=='),
            'example.com'
        ],
        'style-src': [
            SELF,
            'mystyle.net'
        ]
    },
    reportUri: 'https://cspreport.com/send'
});

// result: "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'nonce-gg3g43#$g32gqewgaAEGeag2@#GFQ#g==' example.com; style-src 'self' mystyle.net; report-uri https://cspreport.com/send;"
```

## Params
```js
{
    directives: { [key: string]: string[] },
    presets: policies[] | { [key: string]: policies },
    reportUri: string,
    extend: policies // DEPRECATED use presets instead
}
```

## CSP violation report
There are two ways to send CSP violation report. The first is a [report-uri](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/report-uri) directive. Though it's supported by this library, [it's deprecated](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/report-uri) and should be used only for old browsers. The modern way is a [report-to](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/report-to) directive. Note that `csp-header` only build a `Content-Security-Policy` header, so you have to manage `Report-To` header on your own. But if you use Express, there's an [express-csp-header](https://github.com/frux/csp/tree/master/packages/express-csp-header) middleware that takes care about it.

```js
const { getCSP, nonce, EVAL, INLINE, SELF } = require('csp-header');

getCSP({
    directives: {
        'script-src': [SELF],
        'report-to': 'my-report-group'
    },
    reportUri: 'https://cspreport.com/send'
});

// result: "script-src 'self'; report-uri https://cspreport.com/send; report-to: my-report-group;"
```

## Presets
It's a good idea to group your csp rules into presets. `csp-header` supports two ways of specifying presets. As an array of policies:
```js
{
    presets: [ cspRulesForSomeServiceAPI, cspRulesForMyStaticCDN, someOtherCSPRules ]
}
```

or as a map of presets:
```js
{
    presets: {
        api: cspRulesForSomeServiceAPI,
        statics: cspRulesForMyStaticCDN,
        youtubeVideos: cspRulesForYouTube
    }
}
```

## Preset format
If you have a web-service feel free to publish preset of rules for using your service. For example, your service is ``my-super-service.com``. Just publish preset ``csp-preset-my-super-service`` containing following code:
```js
modules.exports = {
    'script-src': ['api.my-super-service.com'],
    'img-src': ['images.my-super-service.com']
};
```

And you'll get a lot of thanks ;)

## Community presets

* [Disqus Comments (csp-preset-disqus)](https://github.com/Savjee/csp-preset-disqus)
* [Google Analytics (csp-preset-google-analytics)](https://github.com/Savjee/csp-preset-google-analytics)

## Links
- [express-csp-header](https://github.com/frux/csp/tree/master/packages/express-csp-header)
