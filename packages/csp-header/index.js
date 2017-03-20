const allowedPolicies = [
	'base-uri',
	'block-all-mixed-content',
	'child-src',
	'connect-src',
	'default-src',
	'disown-opener',
	'font-src',
	'form-action',
	'frame-ancestors',
	'frame-src',
	'img-src',
	'manifest-src',
	'media-src',
	'object-src',
	'plugin-types',
	'referrer',
	'reflected-xss',
	'report-uri',
	'sandbox',
	'script-src',
	'strict-dynamic',
	'style-src',
	'upgrade-insecure-requests',
	'worker-src'
];

/**
 * Builds Content-Security-Policy header
 * @param policies {object} Policies
 * @returns {string}
 */
function buildCSPString(policies, reportUri){
	let cspString = Object.keys(policies).map(policyName => {
		if(policies[policyName] === true || policies[policyName].length === 0){
			return policyName;
		}
		return `${policyName} ${policies[policyName].join(' ')}`;
	}).join('; ');

	if(typeof reportUri === 'string'){
		cspString += `; report-uri ${reportUri}`;
	}

	return `${cspString};`;
}

function csp(params){
	// params should be an object
	if(typeof params !== 'object'){
		return;
	}

	// property policies is required
	if(typeof params.policies !== 'object'){
		return;
	}

	// filter disallowed policies
	const policies = Object.keys(params.policies).reduce((policies, policyName) => {
		if(allowedPolicies.indexOf(policyName) > -1){
			if(params.policies[policyName] !== false){
				policies[policyName] = params.policies[policyName];
			}
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
	return `'nonce-${nonceId}'`;
};

csp.NONE = "'none'";
csp.SELF = "'self'";
csp.INLINE = "'unsafe-inline'";
csp.EVAL = "'unsafe-eval'";

module.exports = csp;