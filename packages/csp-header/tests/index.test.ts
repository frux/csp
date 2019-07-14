import getCSP, { CSPDirectiveName, CSPHeaderParams, nonce } from '../src';

describe('Empty input', () => {
	test('should return empty string with no args', () => {
		expect(getCSP()).toBe('');
	});
	test('should return empty string with empty both policies and presets', () => {
		expect(getCSP({})).toBe('');
	});
});

describe('Validation', () => {
	test('should filter unknown directives', () => {
		expect(getCSP({
			policies: {
				'script-src': [ 'test1' ],
				['foo1' as unknown as CSPDirectiveName]: [ 'bar1' ]
			},
			presets: [{
				'style-src': [ 'test2' ],
				['foo2' as unknown as CSPDirectiveName]: [ 'bar2' ]
			}]
		})).toBe('script-src test1; style-src test2;');
	});
});

describe('Report URI', () => {
	test('shold add report-uri to CSP string', () => {
		expect(getCSP({
			policies: { 'script-src': ['test.com'] },
			reportUri: 'csp-report.test.com'
		})).toBe('script-src test.com; report-uri csp-report.test.com;');
	});
});

describe('Presets', () => {
	describe('Array format', () => {
		test('should add new directives', () => {
			expect(getCSP({
				policies: {
					'script-src': [ 'domain1.com' ]
				},
				presets: [
					{
						'style-src': [ 'domain1.com' ]
					}
				]
			})).toBe('script-src domain1.com; style-src domain1.com;')
		});

		test('should rewrite merge with existing rules', () => {
			expect(getCSP({
				policies: {
					'script-src': [ 'domain1.com' ]
				},
				presets: [
					{
						'script-src': [ 'domain2.com' ]
					}
				]
			})).toBe('script-src domain1.com, domain2.com;')
		});

		test('should work with empty policies', () => {
			expect(getCSP({
				policies: {},
				presets: [
					{
						'script-src': [ 'domain1.com' ]
					}
				]
			})).toBe('script-src domain1.com;')
		});

		test('should work with no policies', () => {
			expect(getCSP({
				presets: [
					{
						'script-src': [ 'domain1.com' ]
					}
				]
			})).toBe('script-src domain1.com;')
		});

		test('should work with empty presets list', () => {
			expect(getCSP({
				policies: {
					'script-src': [ 'domain1.com' ]
				},
				presets: []
			})).toBe('script-src domain1.com;')
		});

		test('should remove duplicating rules', () => {
			expect(getCSP({
				policies: {
					'script-src': [ 'domain1.com', 'domain2.com' ],
					'style-src': [ 'domain1.com' ]
				},
				presets: [
					{
						'script-src': [ 'domain2.com' ],
						'style-src': [ 'domain2.com' ]
					}
				]
			})).toBe('script-src domain1.com, domain2.com; style-src domain1.com, domain2.com;')
		});

		test('should not mutate source policies', () => {
			let params: CSPHeaderParams = {
				policies: {
					'script-src': [ 'domain1.com' ]
				},
				presets: [
					{
						'script-src': [ 'domain2.com' ]
					}
				]
			};

			getCSP(params);

			expect(params).toMatchObject({
				policies: {
					'script-src': [ 'domain1.com' ]
				},
				presets: [
					{
						'script-src': [ 'domain2.com' ]
					}
				]
			});
		});
	});

	describe('Object format', () => {
		test('should add new directives', () => {
			expect(getCSP({
				policies: {
					'script-src': [ 'domain1.com' ]
				},
				presets: {
					myPreset: {
						'style-src': [ 'domain1.com' ]
					}
				}
			})).toBe('script-src domain1.com; style-src domain1.com;')
		});

		test('should rewrite merge with existing rules', () => {
			expect(getCSP({
				policies: {
					'script-src': [ 'domain1.com' ]
				},
				presets: {
					myPreset: {
						'script-src': [ 'domain2.com' ]
					}
				}
			})).toBe('script-src domain1.com, domain2.com;')
		});

		test('should work with empty policies', () => {
			expect(getCSP({
				policies: {},
				presets: {
					myPreset: {
						'script-src': [ 'domain1.com' ]
					}
				}
			})).toBe('script-src domain1.com;')
		});

		test('should work with no policies', () => {
			expect(getCSP({
				presets: {
					myPreset: {
						'script-src': [ 'domain1.com' ]
					}
				}
			})).toBe('script-src domain1.com;')
		});

		test('should work with empty presets list', () => {
			expect(getCSP({
				policies: {
					'script-src': [ 'domain1.com' ]
				},
				presets: {}
			})).toBe('script-src domain1.com;')
		});

		test('should remove duplicating rules', () => {
			expect(getCSP({
				policies: {
					'script-src': [ 'domain1.com', 'domain2.com' ],
					'style-src': [ 'domain1.com' ]
				},
				presets: {
					myPreset: {
						'script-src': [ 'domain2.com' ],
						'style-src': [ 'domain2.com' ]
					}
				}
			})).toBe('script-src domain1.com, domain2.com; style-src domain1.com, domain2.com;')
		});

		test('should not mutate source policies', () => {
			let params: CSPHeaderParams = {
				policies: {
					'script-src': [ 'domain1.com' ]
				},
				presets: {
					myPreset: {
						'script-src': [ 'domain2.com' ]
					}
				}
			};

			getCSP(params);

			expect(params).toMatchObject({
				policies: {
					'script-src': [ 'domain1.com' ]
				},
				presets: {
					myPreset: {
						'script-src': [ 'domain2.com' ]
					}
				}
			});
		});
	});
});

describe('Boolean directives', () => {
	test('should enable rule with true', () => {
		expect(getCSP({
			policies: {
				'script-src': [ 'domain1.com' ],
				'block-all-mixed-content': true
			}
		})).toBe('script-src domain1.com; block-all-mixed-content;');
	});

	test('should disable rule with false', () => {
		expect(getCSP({
			policies: {
				'script-src': [ 'domain1.com' ],
				'block-all-mixed-content': false
			}
		})).toBe('script-src domain1.com;');
	});
})

describe('Nonce', () => {
	test('should build nonce string for CSP-header', () => {
		expect(nonce('nonceKey')).toBe("'nonce-nonceKey'");
	});
});
