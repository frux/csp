# Content-Security-Policy middleware for Express
[![Build Status](https://travis-ci.org/frux/express-csp-header.svg?branch=master)](https://travis-ci.org/frux/express-csp-header)

## Usage

```js
const csp = require('express-csp-header');
app.use(csp({
    policies: {
        'default-src': [csp.SELF],
        'script-src': [csp.SELF, csp.INLINE, 'somehost.com'],
        'style-src': [csp.SELF, 'mystyles.net'],
        'img-src': ['data:', 'images.com'],
        'worker-src': [csp.NONE],
        'block-all-mixed-content': true
    }
}));

// express will send header "Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' somehost.com; style-src 'self' mystyles.net; img-src data: images.com; workers-src 'none'; block-all-mixed-content; report-uri https://cspreport.com/send;'
```

### nonce parameter

If you want to use nonce parameter you should use NONCE constant. Nonce key will be generated automatically. Also generated nonce key will be stored in ``req.nonce``:

```js
app.use(csp({
    policies: {
        'script-src': [csp.NONCE]
    }
}));
// express will send header with a random nonce key "Content-Security-Policy: script-src 'nonce-pSQ9TwXOMI+HezKshnuRaw==';"

app.use((req, res) => {
    console.log(req.nonce); // 'pSQ9TwXOMI+HezKshnuRaw=='
})
```

### Auto tld

If you have more than one tlds you may want to keep current tld in your security policy. And you able to do this by replacing tld by TLD constant:

```js
app.use(csp({
    policies: {
        'script-src': [`mystatic.${csp.TLD}`]
    }
}));
// for myhost.com it will send: "Content-Security-Policy: script-src mystatic.com;"
// for myhost.net it will send: "Content-Security-Policy: script-src mystatic.net;"
// etc
```

### TLD parsing options

TLD to replace `csp.TLD` in policies is specified using `parse-domain` module. You can pass [its options](https://github.com/peerigon/parse-domain#parseoptions) into `domainOptions` parameter

```js
app.use(csp({
    policies: {
        'script-src': [`mystatic.${csp.TLD}`]
    },
    domainOptions: {
        customTlds: ['example.com']
    }
}
}));
// for myhost.com it will send: "Content-Security-Policy: script-src mystatic.com;"
// for myhost.example.com it will send: "Content-Security-Policy: script-src mystatic.example.com;"
// etc
```

### Policy extending 🔥 DEPRECATED use `presets` instead🔥

Sometimes you need to extend existing policies. You can do it by `extend` param:

```js
var defaultPolicies = {
    'script-src': ['mydefaulthost.com']
};

app.use(csp({
    policies: defaultPolicies,
    extend: {
        'script-src': ['myadditionalhost.com'],
        'style-src': ['mystyles.com']
    }
}));

// result header: 'Content-Security-Policy: script-src mydefaulthost.com myadditionalhost.com; style-src: mystyles.com;'
```

### Presets

Read about preset in [`csp-header` docs](https://github.com/frux/csp-header#presets)

### Content-Security-Policy-Report-Only mode

To switch on Report-Only mode just specify `reportOnly` param:

```js
app.use(csp({
    policies: {
        'script-src': [csp.SELF]
    },
    reportOnly: true
}));
// it will send: "Content-Security-Policy-Report-Only: script-src 'self';"
```

### report-uri parameter

```js
app.use(csp({
    policies: {
        'script-src': [csp.SELF]
    },
    reportUri: 'https://cspreport.com/send'
}));
// express will send header "Content-Security-Policy: script-src 'self'; report-uri https://cspreport.com/send;"
```

If you want to pass some params to the report uri just pass function instead of string:

```js
app.use(csp({
    policies: {
        'script-src': [csp.SELF]
    },
    reportUri: (req, res) => {
        return `https://cspreport.com/send?time=${Number(new Date())}`;
    }
}));
// express will send header "Content-Security-Policy: script-src 'self'; report-uri https://cspreport.com/send?time=1460467355592;"
```
