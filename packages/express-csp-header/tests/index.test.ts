import { Request, Response } from 'express';
import { expressCspHeader, ExpressCSPParams, SELF, INLINE, NONE, NONCE, TLD } from '../src';

function execMiddleware(params?: ExpressCSPParams, req: Partial<Request> = {}) {
	const res = {
		headers: {} as Record<string, string>,
		locals: {} as Record<string, string>,
		set(headerName: string, headerVal: string) {
			this.headers[headerName] = headerVal;
		}
	};

	expressCspHeader(params)(req as unknown as Request, res as unknown as Response, () => {});

	return { req, res };
}

test('should sets CSP header', () => {
	const { res } = execMiddleware({
		directives: {
			'default-src': [SELF],
			'script-src': [SELF, INLINE, 'somehost.com'],
			'style-src': [SELF, 'mystyles.net'],
			'img-src': ['data:', 'images.com'],
			'worker-src': [NONE],
			'block-all-mixed-content': true
		}
	});

	expect(res.headers['Content-Security-Policy'])
		.toStrictEqual("default-src 'self'; script-src 'self' 'unsafe-inline' somehost.com; style-src 'self' mystyles.net; img-src data: images.com; worker-src 'none'; block-all-mixed-content;");
});

test('should not set header with no params', () => {
	const { res } = execMiddleware();

	expect(res.headers['Content-Security-Policy']).toStrictEqual(undefined);
});

test('should set req.nonce and res.locals.nonce', () => {
	const { req, res } = execMiddleware({
		directives: {
			'script-src': [NONCE]
		}
	});

	expect(res.locals).toHaveProperty('nonce');
	expect(req).toHaveProperty('nonce');
	expect(req.nonce).toEqual(res.locals.nonce);
	expect(res.headers['Content-Security-Policy']).toEqual(`script-src \'nonce-${req.nonce}\';`);
});

describe('report-uri', () => {
	test('should accept string', () => {
		const { res } = execMiddleware({
			directives: {'script-src': [SELF]},
			reportUri: 'https://cspreport.com'
		});

		expect(res.headers['Content-Security-Policy'])
			.toStrictEqual("script-src 'self'; report-uri https://cspreport.com;");
	});

	test('should accept function', () => {
		const { res } = execMiddleware({
			directives: {
				'script-src': [SELF]
			},
			reportUri() {
				return 'https://cspreport.com/send?time=' + Number(new Date());
			}
		});
		const expected = /^script-src\s'self';\sreport-uri\shttps:\/\/cspreport\.com\/send\?time=[0-9]+;$/;
		expect(res.headers['Content-Security-Policy']).toMatch(expected);
	});
});

describe('tld', () => {
	test('should replace tld', () => {
		const { res } = execMiddleware(
			{
				directives: {
					'script-src': ['myhost.' + TLD]
				}
			},
			{
				hostname: 'example.com'
			}
		);

		expect(res.headers['Content-Security-Policy'])
			.toStrictEqual('script-src myhost.com;');
	});

	test.each([
		[['my-custom-tld.com']],
		[/my-\w+-tld\.com$/],
		[/\.my-\w+-tld\.com$/],
	])("should handle domainOptions' customTlds: %p", (customTlds) => {
		const {res} = execMiddleware(
			{
				directives: {
					'script-src': ['myhost.' + TLD]
				},
				domainOptions: {
					customTlds
				}
			},
			{
				hostname: 'example.my-custom-tld.com'
			}
		);

		expect(res.headers['Content-Security-Policy'])
			.toStrictEqual('script-src myhost.my-custom-tld.com;');
	});

	test('should ignore %tld% if req.tld is undefined', () => {
		const { res } = execMiddleware(
			{
				directives: {
					'script-src': ['myhost.' + TLD]
				}
			},
			{
				hostname: 'localhost'
			}
		);

		expect(res.headers['Content-Security-Policy'])
			.toStrictEqual('script-src myhost.%tld%;');
	});
});

test('Report-Only', () => {
	const { res } = execMiddleware({
		directives: {
			'script-src': ['myhost.com']
		},
		reportOnly: true
	});

	expect(res.headers['Content-Security-Policy-Report-Only'])
		.toStrictEqual('script-src myhost.com;');
});

describe('Report-To', () => {
	test('should set Report-To header', () => {
		const { res } = execMiddleware({
			directives: {
				'default-src': [SELF],
				'report-to': 'my-report-group'
			},
			reportUri: 'https://cspreport.com/send',
			reportTo: [
				{
					group: 'my-report-group',
					max_age: 30 * 60,
					endpoints: [{ url: 'https://cspreport.com/send'}],
					include_subdomains: true
				}
			]
		});

		expect(res.headers['Content-Security-Policy']).toEqual(
			"default-src 'self'; report-to my-report-group; report-uri https://cspreport.com/send;"
		);
		expect(res.headers['Report-To']).toEqual(
			'{"group":"my-report-group","max_age":1800,"endpoints":[{"url":"https://cspreport.com/send"}],"include_subdomains":true}'
		);
	});

	test('should support multiple report groups', () => {
		const { res } = execMiddleware({
			directives: {
				'default-src': [SELF],
				'report-to': 'my-report-group1'
			},
			reportUri: 'https://cspreport.com/send1',
			reportTo: [
				{
					group: 'my-report-group1',
					endpoints: [{ url: 'https://cspreport.com/send1' }],
					max_age: 30 * 60,
					include_subdomains: true
				},
				{
					group: 'my-report-group2',
					endpoints: [{ url: 'https://cspreport.com/send2' }],
					max_age: 10 * 60,
					include_subdomains: false
				}
			]
		});

		expect(res.headers['Content-Security-Policy']).toEqual(
			"default-src 'self'; report-to my-report-group1; report-uri https://cspreport.com/send1;"
		);
		expect(res.headers['Report-To']).toEqual(
			'{"group":"my-report-group1","endpoints":[{"url":"https://cspreport.com/send1"}],"max_age":1800,"include_subdomains":true},{"group":"my-report-group2","endpoints":[{"url":"https://cspreport.com/send2"}],"max_age":600,"include_subdomains":false}'
		);
	});

	test('should support specifying report groups as a function', () => {
		const { res } = execMiddleware({
			directives: {
				'default-src': [SELF],
				'report-to': 'my-report-group'
			},
			reportUri: req => `https://cspreport.com/send?host=${req.hostname}`,
			reportTo: req => ([
				{
					group: 'my-report-group',
					endpoints: [{ url: `https://cspreport.com/send?host=${req.hostname}` }],
					max_age: 30 * 60,
					include_subdomains: true
				}
			])
		}, { hostname: 'host.com' });

		expect(res.headers['Content-Security-Policy']).toEqual(
			"default-src 'self'; report-to my-report-group; report-uri https://cspreport.com/send?host=host.com;"
		);
		expect(res.headers['Report-To']).toEqual(
			'{"group":"my-report-group","endpoints":[{"url":"https://cspreport.com/send?host=host.com"}],"max_age":1800,"include_subdomains":true}'
		);
	});
});

describe('Reporting-Endpoints', () => {
	test('should set Reporting-Endpoints header with static endpoints', () => {
		const { res } = execMiddleware({
			directives: {
				'default-src': [SELF],
				'report-to': 'csp-endpoint'
			},
			reportingEndpoints: [
				{ name: 'endpoint-1', uri: 'https://reports.example/main' },
				{ name: 'csp-endpoint', uri: 'https://reports.example/csp' }
			]
		});
		expect(res.headers['Content-Security-Policy']).toEqual(
			"default-src 'self'; report-to csp-endpoint;"
		);
		expect(res.headers['Reporting-Endpoints']).toEqual(
			'endpoint-1="https://reports.example/main", csp-endpoint="https://reports.example/csp"'
		);
	});

	test('should support specifying reporting endpoints as a function', () => {
		const { res } = execMiddleware({
			directives: {
				'default-src': [SELF],
			},
			reportingEndpoints: (req) => [
				{ name: 'main', uri: `https://reports.example/${req.hostname}/main` },
				{ name: 'csp', uri: `https://reports.example/${req.hostname}/csp` }
			]
		}, { hostname: 'test.com' });

		expect(res.headers['Content-Security-Policy']).toEqual(
			"default-src 'self';"
		);
		expect(res.headers['Reporting-Endpoints']).toEqual(
			'main="https://reports.example/test.com/main", csp="https://reports.example/test.com/csp"'
		);
	});
	test('should support specifying reporting endpoints as a function with special characters', () => {
		const { res } = execMiddleware({
			directives: {
				'default-src': [SELF],
			},
			reportingEndpoints: (req) => [
				{ name: 'csp-reports', uri: `https://reports.example/${req.headers.login}/csp` }
			]
		}, { headers: {'login':'Abobus"\' Test' }});

		expect(res.headers['Content-Security-Policy']).toEqual(
			"default-src 'self';"
		);
		expect(res.headers['Reporting-Endpoints']).toEqual(
			'csp-reports="https://reports.example/Abobus%22\'%20Test/csp"'
		);
	});

	test('should work together with Report-To header', () => {
		const { res } = execMiddleware({
			directives: {
				'default-src': [SELF],
				'report-to': 'my-report-group'
			},
			reportTo: [{
				group: 'my-report-group',
				max_age: 1800,
				endpoints: [{ url: 'https://reports.example/report-to' }],
				include_subdomains: true
			}],
			reportingEndpoints: [
				{ name: 'endpoint-1', uri: 'https://reports.example/endpoints' }
			]
		});

		expect(res.headers['Report-To']).toEqual(
			'{"group":"my-report-group","max_age":1800,"endpoints":[{"url":"https://reports.example/report-to"}],"include_subdomains":true}'
		);
		expect(res.headers['Reporting-Endpoints']).toEqual(
			'endpoint-1="https://reports.example/endpoints"'
		);
	});
});

describe('processCspString', () => {
	test('should process CSP string', () => {
		const { res } = execMiddleware({
			directives: {
				'default-src': ["#someString#"],
				'script-src': ["#someOtherString#"],
			},
			processCspString: (cspString, req, res) => {
				return cspString.replaceAll('#someString#', 'https://example.com').replaceAll('#someOtherString#', 'https://example2.com');
			}
		});

		expect(res.headers['Content-Security-Policy']).toStrictEqual("default-src https://example.com; script-src https://example2.com;");
	});
});
