var cspHeader = require('csp-header');
var crypto = require('crypto');

function expressCsp(policies, reportUri){
	return function(req, res, next){
		var cspString = cspHeader({
			policies: policies,
			'report-uri': (typeof reportUri === 'function' ? reportUri(req, res) : reportUri)
		});

		if(cspString){
			if(cspString.indexOf(expressCsp.NONCE) > -1){
				req.nonce = crypto.randomBytes(16).toString('base64');
				cspString = cspString.replace(/\%nonce\%/g, cspHeader.nonce(req.nonce));
			}
			res.set('Content-Security-Policy', cspString);
			next();
		}
	}
}

expressCsp.SELF = cspHeader.SELF;
expressCsp.INLINE = cspHeader.INLINE;
expressCsp.EVAL = cspHeader.EVAL;
expressCsp.NONCE = '%nonce%';

module.exports = expressCsp;