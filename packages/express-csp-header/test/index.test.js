import test from 'ava';
import expressCsp from '../';

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

test('should sets CSP header', t => {
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

	t.is(actual.res.headers['Content-Security-Policy'], expected);
});

test('Nonce', t => {
	const actual = mockApp.use(expressCsp({
		policies: {
			'script-src': [expressCsp.NONCE]
		}
	}));

	t.true(/^script-src 'nonce-.+';/.test(actual.res.headers['Content-Security-Policy']));
	t.is(typeof actual.req.nonce, 'string');
});

test('report-uri | string', t => {
	const actual = mockApp.use(expressCsp({
		policies: {'script-src': [expressCsp.SELF]},
		reportUri: 'https://cspreport.com'
	}));

	t.is(actual.res.headers['Content-Security-Policy'], "script-src 'self'; report-uri https://cspreport.com;");
});

test('report-uri | function', t => {
	const actual = mockApp.use(expressCsp({
		policies: {
			'script-src': [expressCsp.SELF]
		},
		reportUri() {
			return 'https://cspreport.com/send?time=' + Number(new Date());
		}
	}));

	t.true(/^script-src\s'self';\sreport-uri\shttps:\/\/cspreport\.com\/send\?time=[0-9]+;$/.test(actual.res.headers['Content-Security-Policy']));
});

test('tld', t => {
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

	t.is(actual.res.headers['Content-Security-Policy'], 'script-src myhost.com;');
});

test('tld | req.tld is undefined', t => {
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

	t.is(actual.res.headers['Content-Security-Policy'], 'script-src myhost.%tld%;');
});

test('Report-Only', t => {
	const actual = mockApp.use(expressCsp({
		policies: {
			'script-src': ['myhost.com']
		},
		reportOnly: true
	}));

	t.is(actual.res.headers['Content-Security-Policy-Report-Only'], 'script-src myhost.com;');
});
