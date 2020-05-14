# Content-Security-Policy middleware for Express
[![NPM version](https://img.shields.io/npm/v/express-csp-header.svg?style=flat)](https://www.npmjs.com/package/express-csp-header)
[![NPM downloads](https://img.shields.io/npm/dm/express-csp-header.svg?style=flat)](https://www.npmjs.com/package/express-csp-header)
[![Dependency Status](https://img.shields.io/david/frux/express-csp-header.svg?style=flat)](https://david-dm.org/frux/express-csp-header)

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

### Presets

Read about preset in [`csp-header` docs](https://github.com/frux/csp-header#presets)

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

## BREAKING CHANGES in express-csp-header@4
### There's no more `privateTld` option supported in domain parsing options
We have to refuse using `parse-domain` package. Though `customTlds` were reimplented (thanks to @FauxFaux) and still working as before.

## BREAKING CHANGES in express-csp-header@3

### 💥 No default export
For compability with JS we have to export expressCspHeader as a named export.
```js
const { expressCspHeader } = require('express-csp-header');
```

### 💥 `policies` was renamed to `directives`

### 💥 Minimal supported version of Node.JS is 8

### 💥 Dropped support of `extend`
`extend` was marked as deprecated in previous versions. It doesn't work anymore. Use `presets` instead.

### 💥 Dropped support of specifying presets as a string
`express-csp-header` used to require preset if you specify it as a string. Now, you should require it by yourself.
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