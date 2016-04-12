var should = require('should');
var csp = require('../index');

describe('Input params', function(){
	it('should returns undefined if params was not specified', function(){
		should(csp()).be.type('undefined');
	});

	it('should returns undefined if policies property was not specified', function(){
		should(csp({
			nonce: true,
			foo: 'bar'
		})).be.type('undefined');
	});

	it('should ignore disallowed policies', function(){
		csp({
			policies: {
				'script-src': [ 'test.com', csp.SELF ],
				'foo-bar-src': [ 'foo', 'bar' ]
			}
		}).should.be.equal('script-src test.com \'self\';');
	});

	it('should add report-uri param', function(){
		csp({
			policies: {
				'script-src': [ csp.SELF ]
			},
			'report-uri': 'https://test.com/cspreport'
		}).should.be.equal('script-src \'self\'; report-uri https://test.com/cspreport;');
	});
});

describe('Utils', function(){
	it('should build nonce param', function(){
		csp.nonce('vg3eer#E4gEbw34gwq3fgqGQWBWQh').should.be.equal('nonce-vg3eer#E4gEbw34gwq3fgqGQWBWQh');
	});

	describe('Constants', function(){
		it('should contains \'self\'', function(){
			csp.SELF.should.be.equal('\'self\'');
		});
		it('should contains \'unsafe-inline\'', function(){
			csp.INLINE.should.be.equal('\'unsafe-inline\'');
		});
		it('should contains \'unsafe-eval\'', function(){
			csp.EVAL.should.be.equal('\'unsafe-eval\'');
		});
	});
});