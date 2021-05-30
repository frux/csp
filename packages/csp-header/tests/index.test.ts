import { getCSP, CSPDirectiveName, CSPHeaderParams, nonce, SELF } from '../src';

describe('CSP building', () => {
	test('should correctly make policy with the only rule', () => {
		expect(getCSP({
			directives: {
				'script-src': ['host.com']
			}
		})).toBe('script-src host.com;');
	});

	test('should correctly make policy with many rules', () => {
		expect(getCSP({
			directives: {
				'script-src': ['host1.com', 'host2.com', 'host3.com', 'host4.com']
			}
		})).toBe('script-src host1.com host2.com host3.com host4.com;');
	});

	test('should correctly make policy with constants', () => {
		expect(getCSP({
			directives: {
				'script-src': [SELF, 'host.com']
			}
		})).toBe('script-src \'self\' host.com;');
	});

	test('should correctly make policy with many directives', () => {
		expect(getCSP({
			directives: {
				'script-src': ['host1.com', 'host2.com'],
				'style-src': ['host1.com', 'host2.com'],
			}
		})).toBe('script-src host1.com host2.com; style-src host1.com host2.com;');
	});
});

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
			directives: {
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
			directives: { 'script-src': ['test.com'] },
			reportUri: 'csp-report.test.com'
		})).toBe('script-src test.com; report-uri csp-report.test.com;');
	});
});

describe('report-to', () => {
	test('should add report-to to CSP string', () => {
		expect(getCSP({
			directives: {
				'script-src': ['test.com'],
				'report-to': 'my-report-group'
			},
		})).toBe('script-src test.com; report-to my-report-group;');
	});
});

describe('Presets', () => {
	describe('Array format', () => {
		test('should add new directives', () => {
			expect(getCSP({
				directives: {
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
				directives: {
					'script-src': [ 'domain1.com' ]
				},
				presets: [
					{
						'script-src': [ 'domain2.com' ]
					}
				]
			})).toBe('script-src domain1.com domain2.com;')
		});

		test('should work with empty policies', () => {
			expect(getCSP({
				directives: {},
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
				directives: {
					'script-src': [ 'domain1.com' ]
				},
				presets: []
			})).toBe('script-src domain1.com;')
		});

		test('should remove duplicating rules', () => {
			expect(getCSP({
				directives: {
					'script-src': [ 'domain1.com', 'domain2.com' ],
					'style-src': [ 'domain1.com' ]
				},
				presets: [
					{
						'script-src': [ 'domain2.com' ],
						'style-src': [ 'domain2.com' ]
					}
				]
			})).toBe('script-src domain1.com domain2.com; style-src domain1.com domain2.com;')
		});

		test('should not mutate source policies', () => {
			const params: CSPHeaderParams = {
				directives: {
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
				directives: {
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
				directives: {
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
				directives: {
					'script-src': [ 'domain1.com' ]
				},
				presets: {
					myPreset: {
						'script-src': [ 'domain2.com' ]
					}
				}
			})).toBe('script-src domain1.com domain2.com;')
		});

		test('should work with empty policies', () => {
			expect(getCSP({
				directives: {},
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
				directives: {
					'script-src': [ 'domain1.com' ]
				},
				presets: {}
			})).toBe('script-src domain1.com;')
		});

		test('should remove duplicating rules', () => {
			expect(getCSP({
				directives: {
					'script-src': [ 'domain1.com', 'domain2.com' ],
					'style-src': [ 'domain1.com' ]
				},
				presets: {
					myPreset: {
						'script-src': [ 'domain2.com' ],
						'style-src': [ 'domain2.com' ]
					}
				}
			})).toBe('script-src domain1.com domain2.com; style-src domain1.com domain2.com;')
		});

		test('should not mutate source policies', () => {
			const params: CSPHeaderParams = {
				directives: {
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
				directives: {
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
			directives: {
				'script-src': [ 'domain1.com' ],
				'block-all-mixed-content': true
			}
		})).toBe('script-src domain1.com; block-all-mixed-content;');
	});

	test('should disable rule with false', () => {
		expect(getCSP({
			directives: {
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
