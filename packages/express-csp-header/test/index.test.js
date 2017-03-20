/* global describe, it */
const should = require('should'); // eslint-disable-line
const expressCsp = require('../');
const mockApp = {
	use(middleware, req, res) {
		req = req || {};
		res = res || {
			headers: {},
			set(headerName, headerVal) {
				this.headers[headerName] = headerVal;
			}
		};
		middleware(req, res, () => {});
		return {req, res};
	}
};

describe('General', () => {
	it('should sets CSP header', () => {
		var actual = mockApp.use(expressCsp({
			policies: {
				'default-src': [expressCsp.SELF],
				'script-src': [expressCsp.SELF, expressCsp.INLINE, 'somehost.com'],
				'style-src': [expressCsp.SELF, 'mystyles.net'],
				'img-src': ['data:', 'images.com'],
				'worker-src': [expressCsp.NONE],
				'block-all-mixed-content': true
			}
		}));
		actual.res.headers['Content-Security-Policy'].should.be.equal("default-src 'self'; script-src 'self' 'unsafe-inline' somehost.com; style-src 'self' mystyles.net; img-src data: images.com; worker-src 'none'; block-all-mixed-content;");
	});

	it('should generates nonce key', () => {
		var actual = mockApp.use(expressCsp({
			policies: {
				'script-src': [expressCsp.NONCE]
			}
		}));

		/^script-src 'nonce-.+';/.test(actual.res.headers['Content-Security-Policy']).should.be.ok();
		actual.req.nonce.should.be.type('string');
	});

	it('should adds report-uri param as string', () => {
		var actual = mockApp.use(expressCsp({
			policies: {'script-src': [expressCsp.SELF]},
			reportUri: 'https://cspreport.com'
		}));

		/report-uri https:\/\/cspreport\.com;$/.test(actual.res.headers['Content-Security-Policy']).should.be.ok();
	});

	it('should adds report-uri param as function', () => {
		var actual = mockApp.use(expressCsp({
			policies: {
				'script-src': [expressCsp.SELF]
			},
			reportUri() {
				return 'https://cspreport.com/send?time=' + Number(new Date());
			}
		}));

		/report-uri https:\/\/cspreport\.com\/send\?time=[0-9]+;$/.test(actual.res.headers['Content-Security-Policy']).should.be.ok();
	});

	it('should replace tld', () => {
		var actual = mockApp.use(expressCsp({
			policies: {
				'script-src': ['myhost.' + expressCsp.TLD]
			}
		}), {
			hostname: 'example.com'
		});

		actual.res.headers['Content-Security-Policy'].should.be.equal('script-src myhost.com;');
	});

	it('shouldn\'t replace tld if tld is not defined', () => {
		var actual = mockApp.use(expressCsp({
			policies: {
				'script-src': ['myhost.' + expressCsp.TLD]
			}
		}), {
			hostname: 'localhost'
		});

		actual.res.headers['Content-Security-Policy'].should.be.equal('script-src myhost.%tld%;');
	});

	it('should supports Report-Only mode', () => {
		var actual = mockApp.use(expressCsp({
			policies: {
				'script-src': ['myhost.com']
			},
			reportOnly: true
		}));

		actual.res.headers['Content-Security-Policy-Report-Only'].should.be.equal('script-src myhost.com;');
	});
});
