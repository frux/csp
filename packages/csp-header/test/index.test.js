const should = require('should');
const csp = require('../index');

describe('Input params', () => {
	it('should returns undefined if params was not specified', () => {
		should(csp()).be.type('undefined');
	});

	it('should returns undefined if policies property was not specified', () => {
		should(csp({
			nonce: true,
			foo: 'bar'
		})).be.type('undefined');
	});

	it('should ignore disallowed policies', () => {
		csp({
			policies: {
				'script-src': [ 'test.com', csp.SELF ],
				'foo-bar-src': [ 'foo', 'bar' ]
			}
		}).should.be.equal('script-src test.com \'self\';');
	});

	it('should add report-uri param', () => {
		csp({
			policies: {
				'script-src': [ csp.SELF ]
			},
			'report-uri': 'https://test.com/cspreport'
		}).should.be.equal('script-src \'self\'; report-uri https://test.com/cspreport;');
	});

	it('should support valueless directives', () => {
		csp({
			policies: {
				'script-src': [ 'test.com' ],
				'block-all-mixed-content': true
			}
		}).should.be.equal('script-src test.com; block-all-mixed-content;');

		csp({
			policies: {
				'script-src': [ 'test.com' ],
				'block-all-mixed-content': []
			}
		}).should.be.equal('script-src test.com; block-all-mixed-content;');

		csp({
			policies: {
				'script-src': [ 'test.com' ],
				'block-all-mixed-content': ''
			}
		}).should.be.equal('script-src test.com; block-all-mixed-content;');
	});
});

describe('Utils', () => {
	it('should build nonce param', () => {
		csp.nonce('vg3eer#E4gEbw34gwq3fgqGQWBWQh').should.be.equal('\'nonce-vg3eer#E4gEbw34gwq3fgqGQWBWQh\'');
	});

	describe('Constants', () => {
		it('should contains \'self\'', () => {
			csp.SELF.should.be.equal('\'self\'');
		});
		it('should contains \'unsafe-inline\'', () => {
			csp.INLINE.should.be.equal('\'unsafe-inline\'');
		});
		it('should contains \'unsafe-eval\'', () => {
			csp.EVAL.should.be.equal('\'unsafe-eval\'');
		});
		it('should contains \'none\'', () => {
			csp.NONE.should.be.equal('\'none\'');
		});
	});
});