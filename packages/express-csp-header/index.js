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
	policies = params.policies;
	extend = params.extend;
	reportUri = params.reportUri;
	reportOnly = Boolean(params.reportOnly);

	if(typeof extend === 'object'){
		policies = extendPolicies(policies, extend);
	}

	return function(req, res, next){
		var cspString = cspHeader({
			policies: policies,
			'report-uri': (typeof reportUri === 'function' ? reportUri(req, res) : reportUri)
		});

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
			res.set(CSP_HEADER_NAME + (reportOnly ? CSP_REPORT_ONLY : ''), cspString);
			next();
		}
	}
}

function extendPolicies(original, extension){
	var extended = Object.assign(original);
	Object.keys(extension).forEach(function(policyName){
		var extPolicy = extension[policyName],
			origPolicy = original[policyName];

		if(!(extPolicy instanceof Array)){
			throw new Error('');
		}
		if(typeof origPolicy !== 'undefined'){
			extPolicy.forEach(function(rule){
				if(typeof rule === 'string' && origPolicy.indexOf(rule) === -1){
					extended[policyName].push(rule);
				}
			});
		}else{
			extended[policyName] = extPolicy;
		}
	});
	return extended;
}

expressCsp.SELF = cspHeader.SELF;
expressCsp.INLINE = cspHeader.INLINE;
expressCsp.EVAL = cspHeader.EVAL;
expressCsp.NONCE = '%nonce%';
expressCsp.TLD = '%tld%';

module.exports = expressCsp;