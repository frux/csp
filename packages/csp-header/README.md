# csp-header
Content-Security-Policy header generator for Node.JS

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
It's a good idea to group your csp rules into presets. `csp-header` supports two way of using presets.
It can be specified as an array of policies:
```js
{
    presets: [ cspRulesForSomeServiceAPI, cspRulesForMyStaticCDN, someOtherCSPRules ]
}
```

or as a keyed object:
```js
{
    presets: {
        api: cspRulesForSomeServiceAPI,
        statics: cspRulesForMyStaticCDN,
        youtubeVideos: cspRulesForYouTube
    }
}
```

The second way allows you to overwrite presets by conditions:
```js
const cspRules = require('./config/csp');

if (NODE_ENV === 'development') {
    cspRules.presets.statics = ['self'];
}
```

Also you can use presets from npm prefixed by `csp-preset` as strings:
```js
{
    presets: {
        superPuperService: 'super-puper-service' // takes node_modules/csp-preset-super-puper-service
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

And you will get a lot of thanks ;)


## Extend 🔥 DEPRECATED! use `presets` instead 🔥
If you want to extend your config by some rules:
```js
const myCSPPolicies = require('./my-csp-rules');

csp({
    policies: myCSPPolicies,
    extend: {
        'connect-src': ['test.com']
    }
});
```
