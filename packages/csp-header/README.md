# csp-header
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
    }
    reportUri: 'https://cspreport.com/send'
});

// result: "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'nonce-gg3g43#$g32gqewgaAEGeag2@#GFQ#g==' example.com; style-src 'self' mystyle.net; report-uri https://cspreport.com/send;"
```

## Params
```js
{
    directives: { [key: string]: string[] },
    presets: policies[] | { [key: string]: policies }
    reportUri: string,
    extend: policies // DEPRECATED use presets instead
}
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

## BREAKING CHANGES in csp-header@2

### 🔨 No default export
For compability with JS we have to export getCSP as a named export.
```js
const { getCSP } = require('csp-header');
```

### 🔨 `policies` was renamed to `directives`

### 🔨 Minimal supported version of Node.JS is 8

### 🔨 Dropped support of `extend`
`extend` was marked as deprecated in previous versions. It doesn't work anymore. Use `presets` instead.

### 🔨 Dropped support of specifying presets as a string
`csp-header` used to require preset if you specify it as a string. Now, you should require it by yourself.
Before:
```js
{
    //...
    presets: ['csp-preset-myservice']
}
```
Now:
```js
{
    //...
    presets: [require('csp-preset-myservice')]
}
```

### 🔨 Calling with no arguments returns an empty string
It used to return `undefined`.

## Links
- [express-csp-header](https://github.com/frux/express-csp-header)
