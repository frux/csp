var cspHeader = require('csp-header');
var crypto = require('crypto');
var parseDomain = require('parse-domain');
var CSP_HEADER_NAME = 'Content-Security-Policy';
var CSP_REPORT_ONLY = '-Report-Only';

function expressCsp(params){
	var policies,
		reportUri,
		reportOnly;

	params = params || {};

	return function(req, res, next){
		var cspHeaderParams = {
			policies: params.policies,
			extend: params.extend,
			presets: params.presets,
			'report-uri': (typeof params.reportUri === 'function' ? params.reportUri(req, res) : params.reportUri)
		}
		var cspString = cspHeader(cspHeaderParams);

		if(cspString){
			if(cspString.indexOf(expressCsp.NONCE) > -1){
				req.nonce = crypto.randomBytes(16).toString('base64');
				cspString = cspString.replace(new RegExp(expressCsp.NONCE, 'g'), cspHeader.nonce(req.nonce));
			}
			if(cspString.indexOf(expressCsp.TLD) > -1){
				var domain = parseDomain(req.hostname || req.host);
				var tld = domain && domain.tld;
				if(tld){
					cspString = cspString.replace(new RegExp(expressCsp.TLD, 'g'), tld);
				}
			}
			res.set(CSP_HEADER_NAME + (params.reportOnly ? CSP_REPORT_ONLY : ''), cspString);
			next();
		}
	}
}

expressCsp.SELF = cspHeader.SELF;
expressCsp.INLINE = cspHeader.INLINE;
expressCsp.EVAL = cspHeader.EVAL;
expressCsp.NONE = cspHeader.NONE;
expressCsp.NONCE = '%nonce%';
expressCsp.TLD = '%tld%';

module.exports = expressCsp;