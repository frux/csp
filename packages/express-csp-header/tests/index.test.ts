/* global describe, test, expect */
import { Request, Response } from 'express';
import { expressCspHeader, ExpressCSPParams, SELF, INLINE, NONE, NONCE, TLD } from '../src';

function execMiddleware(params?: ExpressCSPParams, req: Partial<Request> = {}) {
	let res = {
		headers: {} as Record<string, string>,
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

test('should set req.nonce', () => {
	const { req, res} = execMiddleware({
		directives: {
			'script-src': [NONCE]
		}
	});

	expect(res.headers['Content-Security-Policy']).toMatch(/^script-src 'nonce-.+';/);
	expect(req).toHaveProperty('nonce');
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
