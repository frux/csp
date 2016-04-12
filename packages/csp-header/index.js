var allowedPolicies = [
	'base-uri',
	'default-src',
	'script-src',
	'style-src',
	'img-src',
	'frame-src',
	'script-src',
	'child-src',
	'connect-src',
	'object-src',
	'media-src',
	'font-src',
	'form-action',
	'frame-ancestors',
	'plugin-types'
];

/**
 * Builds Content-Security-Policy header
 * @param policies {object} Policies
 * @returns {string}
 */
function buildCSPString(policies, reportUri){
	var cspString = Object.keys(policies).map(function(policyName){
		return policyName + ' ' + policies[policyName].join(' ');
	}).join('; ') + ';';

	if(typeof reportUri === 'string'){
		cspString += ' report-uri ' + reportUri + ';';
	}

	return cspString;
}

function csp(params){
	var policies;

	// params should be an object
	if(typeof params !== 'object'){
		return;
	}

	// property policies is required
	if(typeof params.policies !== 'object'){
		return;
	}

	// filter disallowed policies
	policies = Object.keys(params.policies).reduce(function(policies, policyName){
		if(allowedPolicies.indexOf(policyName) > -1){
			policies[policyName] = params.policies[policyName];
		}
		return policies;
	}, {});

	return buildCSPString(policies, params['report-uri']);
}

/**
 * Build nonce param
 * @param nonceId {string} Nonce param id
 * @returns {string} Nonce param
 */
csp.nonce = function(nonceId){
	return '\'nonce-' + nonceId + '\'';
};

csp.SELF = '\'self\'';
csp.INLINE = '\'unsafe-inline\'';
csp.EVAL = '\'unsafe-eval\'';

module.exports = csp;