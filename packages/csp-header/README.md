# csp-header
Content-Security-Policy header generator for Node

## Usage
```js
const csp = require('csp-header');
csp({
    policies: {
        'script-src': [
            csp.SELF,
            csp.INLINE,
            csp.EVAL,
            csp.nonce('gg3g43#$g32gqewgaAEGeag2@#GFQ#g=='),
            'example.com'
        ],
        'style-src': [
            csp.SELF,
            'mystyle.net'
        ]
    }
    'report-uri': 'https://cspreport.com/send'
});

// result: "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'nonce-gg3g43#$g32gqewgaAEGeag2@#GFQ#g==' example.com; style-src 'self' mystyle.net; report-uri https://cspreport.com/send;"
```

## Params
```js
{
    policies: { [key: string]: string[] },
    presets: policies[] | { [key: string]: policies }
    'report-uri': string,
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
If you have a web-service feel free to publish preset of rules for using your service. For example your service is ``my-super-service.com``. Just publish preset ``csp-preset-my-super-service`` containing following code:
```js
modules.exports = {
    'script-src': ['api.my-super-service.com'],
    'img-src': ['images.my-super-service.com']
};
```

And you'll get a lot of thanks ;)

## BREAKING CHANGES in csp-header@2

### `policies` was renamed to `directives`

### Dropped support of `extend`
`extend` was marked as deprecated in previous versions. It doesn't work anymore. Use `presets` instead.

### Dropped support of specifying presets as a string
`csp-header` used to require preset if you specify it as a string. Now, please require it by yourself.
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

### Calling with no arguments returns empty string
It used to return `undefined`.
