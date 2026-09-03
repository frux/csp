# CSP
Hear is a couple of libraries to work with [Content-Security-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) in your JavaScript application.

---

## [csp-header](https://github.com/frux/csp/tree/master/packages/csp-header#readme)
[![NPM version](https://img.shields.io/npm/v/csp-header.svg?style=flat)](https://www.npmjs.com/package/csp-header)
[![NPM downloads](https://img.shields.io/npm/dm/csp-header.svg?style=flat)](https://www.npmjs.com/package/csp-header)

Zero-dependency library for generating CSP policies. It can be used for both HTTP header and `<meta>` element. Supports presets for organizing and managing your policies.

---

## [express-csp-header](https://github.com/frux/csp/tree/master/packages/express-csp-header#readme)
[![NPM version](https://img.shields.io/npm/v/express-csp-header.svg?style=flat)](https://www.npmjs.com/package/express-csp-header)
[![NPM downloads](https://img.shields.io/npm/dm/express-csp-header.svg?style=flat)](https://www.npmjs.com/package/express-csp-header)

This is a `csp-header` wrapped in a middleware with auto-tld support and nonce generation. It's ready to use in your Express application.

## Releasing

Both packages are released together and must have the same version. Run the release from a clean `master` branch and make sure `npm whoami` returns an account that can publish both packages.

The examples below use `6.4.0` as the new version. Replace it with the actual version being released.

1. Update both package versions and the internal dependency:

   ```bash
   npm --no-git-tag-version version 6.4.0 --workspaces
   npm pkg set 'dependencies.csp-header=^6.4.0' --workspace express-csp-header
   npm install --package-lock-only
   ```

2. Add the release notes to `CHANGELOG.md`, then build and verify everything:

   ```bash
   npm run clean
   npm test
   npm run lint
   npm pack --dry-run --workspace csp-header
   npm pack --dry-run --workspace express-csp-header
   ```

3. Commit the release and create its tag:

   ```bash
   git add CHANGELOG.md package.json package-lock.json packages/*/package.json
   git commit -m "chore(release): publish 6.4.0"
   git tag v6.4.0
   ```

4. Publish the core package first, followed by the Express middleware:

   ```bash
   npm publish --workspace csp-header --access public
   npm publish --workspace express-csp-header --access public
   ```

   npm will prompt for a one-time password when the publishing account requires two-factor authentication.

5. Push the release commit and tag:

   ```bash
   git push origin master --follow-tags
   ```

Published package versions cannot be reused. Always check the dry-run output before publishing.
