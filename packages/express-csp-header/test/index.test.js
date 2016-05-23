var should = require('should'),
	expressCsp = require('../'),
	mockApp = {
		use: function(middleware, req, res){
			var req = req || {},
				res = res || {
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
			policies: {
				'script-src': [ expressCsp.SELF, 'myhost.com' ],
				'style-src': [ expressCsp.SELF, expressCsp.INLINE ]
			}
		}));
		actual.res.headers['Content-Security-Policy'].should.be.equal('script-src \'self\' myhost.com; style-src \'self\' \'unsafe-inline\';');
	});

	it('should generates nonce key', function(){
		var actual = mockApp.use(expressCsp({
				policies: {
					'script-src': [ expressCsp.NONCE ]
				}
			}));

		/^script\-src \'nonce\-.+\'\;/.test(actual.res.headers['Content-Security-Policy']).should.be.ok();
		actual.req.nonce.should.be.type('string');
	});

	it('should adds report-uri param as string', function(){
		var actual = mockApp.use(expressCsp({
			policies: { 'script-src': [ expressCsp.SELF ] },
			reportUri: 'https://cspreport.com'
		}));

		/report\-uri https\:\/\/cspreport\.com\;$/.test(actual.res.headers['Content-Security-Policy']).should.be.ok();
	});

	it('should adds report-uri param as function', function(){
		var actual = mockApp.use(expressCsp({
			policies: {
				'script-src': [ expressCsp.SELF ]
			},
			reportUri: function(req, res){
				return 'https://cspreport.com/send?time=' + Number(new Date());
			}
		}));

		/report\-uri https\:\/\/cspreport\.com\/send\?time\=[0-9]+\;$/.test(actual.res.headers['Content-Security-Policy']).should.be.ok();
	});

	it('should replace tld', function(){
		var actual = mockApp.use(expressCsp({
			policies: {
				'script-src': [ 'myhost.' + expressCsp.TLD ]
			}
		}), {
			hostname: 'example.com'
		});

		actual.res.headers['Content-Security-Policy'].should.be.equal('script-src myhost.com;');
	});

	it('shouldn\'t replace tld if tld is not defined', function(){
		var actual = mockApp.use(expressCsp({
			policies: {
				'script-src': [ 'myhost.' + expressCsp.TLD ]
			}
		}), {
			hostname: 'localhost'
		});

		actual.res.headers['Content-Security-Policy'].should.be.equal('script-src myhost.%tld%;');
	});

	it('should supports Report-Only mode', function(){
		var actual = mockApp.use(expressCsp({
			policies: {
				'script-src': [ 'myhost.com' ]
			},
			reportOnly: true
		}));

		actual.res.headers['Content-Security-Policy-Report-Only'].should.be.equal('script-src myhost.com;');
	});
});

describe('Extending', function(){
	it('should extend existing policy', function(){
		var actual = mockApp.use(expressCsp({
			policies: {
				'script-src': [ 'myhost.com' ]
			},
			extend: {
				'script-src': [ 'additional.host.com' ]
			}
		}));

		actual.res.headers['Content-Security-Policy'].should.be.equal('script-src myhost.com additional.host.com;');
	});

	it('shouldn\'t duplicate rule', function(){
		var actual = mockApp.use(expressCsp({
			policies: {
				'script-src': [ 'myhost.com' ]
			},
			extend: {
				'script-src': [ 'myhost.com' ]
			}
		}));

		actual.res.headers['Content-Security-Policy'].should.be.equal('script-src myhost.com;');
	});

	it('should add new policy', function(){
		var actual = mockApp.use(expressCsp({
			policies: {
				'script-src': [ 'myhost.com' ]
			},
			extend: {
				'style-src': [ 'newhost.com' ]
			}
		}));

		actual.res.headers['Content-Security-Policy'].should.be.equal('script-src myhost.com; style-src newhost.com;');
	});
});