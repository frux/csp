# csp-header
Content-Security-Policy header generator for Node.JS

## Usage
```js
var csp = require('csp-header');
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
  },
  'report-uri': 'https://cspreport.com/send'
});

// result: "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'nonce-gg3g43#$g32gqewgaAEGeag2@#GFQ#g==' example.com; style-src 'self' mystyle.net; report-uri https://cspreport.com/send;"
```
