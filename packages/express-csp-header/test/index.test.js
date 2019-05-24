/* global describe, test, expect */
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

test('should sets CSP header', () => {
	const actual = mockApp.use(expressCsp({
		policies: {
			'default-src': [expressCsp.SELF],
			'script-src': [expressCsp.SELF, expressCsp.INLINE, 'somehost.com'],
			'style-src': [expressCsp.SELF, 'mystyles.net'],
			'img-src': ['data:', 'images.com'],
			'worker-src': [expressCsp.NONE],
			'block-all-mixed-content': true
		}
	}));
	const expected = "default-src 'self'; script-src 'self' 'unsafe-inline' somehost.com; style-src 'self' mystyles.net; img-src data: images.com; worker-src 'none'; block-all-mixed-content;";

	expect(actual.res.headers['Content-Security-Policy']).toBe(expected);
});

test('should no params', () => {
	const actual = mockApp.use(expressCsp());
	const expected = undefined;

	expect(actual.res.headers['Content-Security-Policy']).toBe(expected);
});

test('should set req.nonce', () => {
	const actual = mockApp.use(expressCsp({
		policies: {
			'script-src': [expressCsp.NONCE]
		}
	}));

	expect(/^script-src 'nonce-.+';/.test(actual.res.headers['Content-Security-Policy']))
		.toBeTruthy();
	expect(typeof actual.req.nonce).toBe('string');
});

describe('report-uri', () => {
	test('should accept string', () => {
		const actual = mockApp.use(expressCsp({
			policies: {'script-src': [expressCsp.SELF]},
			reportUri: 'https://cspreport.com'
		}));

		expect(actual.res.headers['Content-Security-Policy'])
			.toBe("script-src 'self'; report-uri https://cspreport.com;");
	});

	test('should accept function', () => {
		const actual = mockApp.use(expressCsp({
			policies: {
				'script-src': [expressCsp.SELF]
			},
			reportUri() {
				return 'https://cspreport.com/send?time=' + Number(new Date());
			}
		}));
		const expected = /^script-src\s'self';\sreport-uri\shttps:\/\/cspreport\.com\/send\?time=[0-9]+;$/;
		expect(actual.res.headers['Content-Security-Policy']).toMatch(expected);
	});
});

describe('tld', () => {
	test('should replace tld', () => {
		const actual = mockApp.use(
			expressCsp({
				policies: {
					'script-src': ['myhost.' + expressCsp.TLD]
				}
			}),
			{
				hostname: 'example.com'
			}
		);

		expect(actual.res.headers['Content-Security-Policy'])
			.toBe('script-src myhost.com;');
	});

	test('should pass domainOptions to parse-domain', () => {
		const actual = mockApp.use(
			expressCsp({
				policies: {
					'script-src': ['myhost.' + expressCsp.TLD]
				},
				domainOptions: {
					customTlds: ['my-custom-tld.com']
				}
			}),
			{
				hostname: 'example.my-custom-tld.com'
			}
		);

		expect(actual.res.headers['Content-Security-Policy'])
			.toBe('script-src myhost.my-custom-tld.com;');
	});

	test('should ignore %tld% if req.tld is undefined', () => {
		const actual = mockApp.use(
			expressCsp({
				policies: {
					'script-src': ['myhost.' + expressCsp.TLD]
				}
			}),
			{
				hostname: 'localhost'
			}
		);

		expect(actual.res.headers['Content-Security-Policy'])
			.toBe('script-src myhost.%tld%;');
	});
});

test('Report-Only', () => {
	const actual = mockApp.use(expressCsp({
		policies: {
			'script-src': ['myhost.com']
		},
		reportOnly: true
	}));

	expect(actual.res.headers['Content-Security-Policy-Report-Only'])
		.toBe('script-src myhost.com;');
});
