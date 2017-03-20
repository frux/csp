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

## Extending
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

## Presets
You can use csp presets prefixed by 'csp-preset'. If you have a web-service it would be great if you write preset with rules for your service users.

E.g. your service is called ``my-super-service.com``. You publish preset ``csp-preset-my-super-service`` containing following code:
```js
modules.exports = {
  'script-src': ['api.my-super-service.com'],
  'img-src': ['images.my-super-service.com']
};
```

Then someone wants to configure its CSP to work with your service. And now it's so easy:
```js
const myCSPPolicies = require('./my-csp-rules');

csp({
  policies: myCSPPolicies,
  presets: ['my-super-service']
});
```

And you will get a lot of thanks ;)
