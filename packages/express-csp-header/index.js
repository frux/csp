var cspHeader = require('csp-header');
var crypto = require('crypto');

function expressCsp(policies, reportUri){
	var cspString = cspHeader({
		policies: policies,
		'report-uri': reportUri
	});

	return function(req, res, next){
		if(cspString){
			if(cspString.indexOf(expressCsp.NONCE) > -1){
				req.nonce = crypto.randomBytes(16).toString('base64');
				cspString = cspString.replace('%nonce%', cspHeader.nonce(req.nonce));
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