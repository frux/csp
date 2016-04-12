var should = require('should'),
	expressCsp = require('../'),
	mockApp = {
		use: function(middleware){
			var req = {},
				res = {
					headers: {},
					set: function(headerName, headerVal){
						this.headers[headerName] = headerVal;
					}
				};
			middleware(req, res, function(){});
			return {req: req, res: res};
		}
	};

describe('General', function(){
	it('should sets CSP header', function(){
		var actual = mockApp.use(expressCsp({
			'script-src': [ expressCsp.SELF, 'myhost.com' ],
			'style-src': [ expressCsp.SELF, expressCsp.INLINE ]
		}));
		actual.res.headers['Content-Security-Policy'].should.be.equal('script-src \'self\' myhost.com; style-src \'self\' \'unsafe-inline\';');
	});

	it('should generates nonce key', function(){
		var actual = mockApp.use(expressCsp({
			'script-src': [ expressCsp.NONCE ]
		}));

		/^script\-src \'nonce\-.+\'\;/.test(actual.res.headers['Content-Security-Policy']).should.be.ok();
		actual.req.nonce.should.be.type('string');
	});

	it('should adds report-uri param', function(){
		var actual = mockApp.use(expressCsp({
			'script-src': [ expressCsp.SELF ]
		}, 'https://cspreport.com'));

		/report\-uri https\:\/\/cspreport\.com\;$/.test(actual.res.headers['Content-Security-Policy']).should.be.ok();
	});
});

console.log(mockApp.use(expressCsp({
	'script-src': [ expressCsp.NONCE ]
})).res.headers);