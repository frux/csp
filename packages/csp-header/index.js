'use strict';
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
function buildCSPString(policies, reportUri) {
	let cspString = Object.keys(policies).map(policyName => {
		if (policies[policyName] === true || policies[policyName].length === 0) {
			return policyName;
		}
		return `${policyName} ${policies[policyName].join(' ')}`;
	}).join('; ');

	if (typeof reportUri === 'string') {
		cspString += `; report-uri ${reportUri}`;
	}

	return `${cspString};`;
}

function csp(params) {
	// params should be an object
	if (typeof params !== 'object') {
		return;
	}

	if (!params.policies) {
		if (params.presets || params.extend) {
			params.policies = {};
		} else {
			return;
		}
	}

	// filter disallowed policies
	let policies = Object.keys(params.policies).reduce((policies, policyName) => {
		if (allowedPolicies.indexOf(policyName) > -1) {
			if (params.policies[policyName] !== false) {
				policies[policyName] = params.policies[policyName];
			}
		}
		return policies;
	}, {});

	if (params.presets) {
		// Object.keys also works with array keys
		Object.keys(params.presets).forEach(key => {
			const preset = params.presets[key];
			let presetPolicies;

			if (typeof preset === 'string') {
				presetPolicies = requirePreset(preset);
			} else {
				presetPolicies = preset;
			}

			policies = extendPolicies(policies, presetPolicies);
		});
	}

	if (params.extend) {
		policies = extendPolicies(policies, params.extend);
	}

	return buildCSPString(policies, params['report-uri']);
}

/**
 * Resolves require string
 * @param {string} presetName Relative/absolute path or full/short module name
 * @returns {string}
 */
function resolvePreset(presetName) {
	const isFullModuleName = presetName.indexOf('csp-preset') === 0;

	if (isFullModuleName) {
		return presetName;
	}
	return `csp-preset-${presetName}`;
}

function requirePreset(presetName) {
	try {
		return require(resolvePreset(presetName));
	} catch (err) {
		throw new Error(`CSP preset ${presetName} is not found`);
	}
}

/**
 * Extends policies object
 * @param {Object} original Original policies
 * @param {Object} extension Additional policies
 * @returns {Object} Extended policies
 */
function extendPolicies(original, extension) {
	const extended = Object.assign(original);

	Object.keys(extension).forEach(policyName => {
		const extPolicy = extension[policyName];
		const origPolicy = original[policyName];

		if (origPolicy === undefined) {
			extended[policyName] = extPolicy;
		} else if (Array.isArray(extPolicy) && extPolicy.length > 0 && Array.isArray(origPolicy)) {
			extPolicy.forEach(rule => {
				if (typeof rule === 'string' && origPolicy.indexOf(rule) === -1) {
					extended[policyName].push(rule);
				}
			});
		} else {
			extended[policyName] = extPolicy[policyName];
		}
	});

	return extended;
}

/**
 * Build nonce param
 * @param nonceId {string} Nonce param id
 * @returns {string} Nonce param
 */
csp.nonce = function (nonceId) {
	return `'nonce-${nonceId}'`;
};

csp.resolvePreset = resolvePreset;

csp.NONE = "'none'";
csp.SELF = "'self'";
csp.INLINE = "'unsafe-inline'";
csp.EVAL = "'unsafe-eval'";

module.exports = csp;
