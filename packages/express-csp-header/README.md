# Content-Security-Policy middleware for Express
[![NPM version](https://img.shields.io/npm/v/express-csp-header.svg?style=flat)](https://www.npmjs.com/package/express-csp-header)
[![NPM downloads](https://img.shields.io/npm/dm/express-csp-header.svg?style=flat)](https://www.npmjs.com/package/express-csp-header)
[![Dependency Status](https://img.shields.io/david/frux/express-csp-header.svg?style=flat)](https://david-dm.org/frux/express-csp-header)

Middleware wrapper for [csp-header](https://github.com/frux/csp/tree/master/packages/csp-header), so for more information read its documentation.

## Usage

```js
const { expressCspHeader, INLINE, NONE, SELF } = require('express-csp-header');

app.use(expressCspHeader({
    directives: {
        'default-src': [SELF],
        'script-src': [SELF, INLINE, 'somehost.com'],
        'style-src': [SELF, 'mystyles.net'],
        'img-src': ['data:', 'images.com'],
        'worker-src': [NONE],
        'block-all-mixed-content': true
    }
}));

// express will send header "Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' somehost.com; style-src 'self' mystyles.net; img-src data: images.com; workers-src 'none'; block-all-mixed-content; report-uri https://cspreport.com/send;'
```

### nonce parameter

If you want to use nonce parameter you should use `NONCE` constant. Nonce key will be generated automatically. Also generated nonce key will be stored in `req.nonce`:

```js
const { expressCspHeader, NONCE } = require('express-csp-header');

app.use(expressCspHeader({
    directives: {
        'script-src': [NONCE]
    }
}));
// express will send header with a random nonce key "Content-Security-Policy: script-src 'nonce-pSQ9TwXOMI+HezKshnuRaw==';"

app.use((req, res) => {
    console.log(req.nonce); // 'pSQ9TwXOMI+HezKshnuRaw=='
})
```

### Auto tld

If you have more than one tlds you may want to have only current tld in your security policy. You can do this by replacing tld by `TLD` constant:

```js
const { expressCspHeader, TLD } = require('express-csp-header');

app.use(expressCspHeader({
    directives: {
        'script-src': [`mystatic.${TLD}`]
    }
}));
// for myhost.com it will send: "Content-Security-Policy: script-src mystatic.com;"
// for myhost.net it will send: "Content-Security-Policy: script-src mystatic.net;"
// etc
```

### TLD parsing options
`express-csp-header` uses [psl](https://www.npmjs.com/package/psl) package to parse tld for auto-tld feature. If you have a custom tld you can specify it as an array or a regexp.

```js
const { expressCspHeader, TLD } = require('express-csp-header');

app.use(expressCspHeader({
    directives: {
        'script-src': [`mystatic.${TLD}`]
    },
    domainOptions: {
        customTlds: ['example.com']
    }
}));
// for myhost.com it will send: "Content-Security-Policy: script-src mystatic.com;"
// for myhost.example.com it will send: "Content-Security-Policy: script-src mystatic.example.com;"
// etc
```

### Custom processing

```js
const { expressCspHeader } = require('express-csp-header');

app.use(expressCspHeader({
    directives: {
        'default-src': ["#someString#"],
        'script-src': ["#someOtherString#"],
    },
    processCspString: (cspString, req, res) => {
        // here you can process final cspString
        return cspString.replaceAll('#someString#', 'https://example.com').replaceAll('#someOtherString#', 'https://example2.com');
    }
}));
```

## CSP violation report
For more information read [csp-header documentation](https://github.com/frux/csp/tree/master/packages/csp-header#csp-violation-report). `express-csp-header` helps you manage both `Content-Security-Policy` and `Reporting-Endpoints` headers. [Report-to headers  is no longer recommended to use](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Report-To)

```js
const { expressCspHeader, INLINE, NONE, SELF } = require('express-csp-header');

app.use(expressCspHeader({
    directives: {
        'default-src': [SELF],
        'report-to': 'csp-default'
    },
    reportUri: 'https://cspreport.com/send',
    reportingEndpoints: [
        {'csp-default': 'https://cspreport.com/send'}
    ]  
}));

/* express will send two headers
1. Content-Security-Policy: default-src 'self'; report-to csp-default; report-uri https://cspreport.com/send;
2. Reporting-Endpoints: csp-default="https://cspreport.com/send"
*/
```

### Presets

Read about preset in [`csp-header` docs](https://github.com/frux/csp/tree/master/packages/csp-header#presets)

### Content-Security-Policy-Report-Only mode

To switch on Report-Only mode just specify `reportOnly` param:

```js
const { expressCspHeader, SELF } = require('express-csp-header');

app.use(expressCspHeader({
    directives: {
        'script-src': [SELF]
    },
    reportOnly: true
}));
// it will send: "Content-Security-Policy-Report-Only: script-src 'self';"
```

### report-uri parameter

```js
const { expressCspHeader, SELF } = require('express-csp-header');

app.use(expressCspHeader({
    directives: {
        'script-src': [SELF]
    },
    reportUri: 'https://cspreport.com/send'
}));
// express will send header "Content-Security-Policy: script-src 'self'; report-uri https://cspreport.com/send;"
```

If you want to pass some params to the report uri just pass function instead of string:

```js
const { expressCspHeader, SELF } = require('express-csp-header');

app.use(expressCspHeader({
    directives: {
        'script-src': [SELF]
    },
    reportUri: (req, res) => {
        return `https://cspreport.com/send?time=${Number(new Date())}`;
    }
}));
// express will send header "Content-Security-Policy: script-src 'self'; report-uri https://cspreport.com/send?time=1460467355592;"
```

## Links
- [csp-header](https://github.com/frux/csp/tree/master/packages/csp-header)