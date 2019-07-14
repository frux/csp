/**
 * Build CSP header value from params
 */
export default function getCSP(params: CSPHeaderParams = {}): string {
	let { policies = {}, presets = {}, reportUri } = params;
	let presetsList = normalizePresetsList(presets);
	let mergedPolicies = applyPresets(policies, presetsList);

	return policyToString(mergedPolicies, reportUri);
}

/**
 * Build CSP header value from resolved policy
 */

function policyToString(policies: CSPPolicies, reportUri?: string): string {
	let cspStringParts: string[] = [];

	for (let directiveName in policies) {
		if (!policies.hasOwnProperty(directiveName)) {
			continue;
		}

		let directiveValue: CSPDirectiveValue = policies[directiveName as keyof CSPPolicies];
		let directiveRulesString = getDirectiveString(
			directiveName as CSPDirectiveName,
			directiveValue
		);

		if (directiveRulesString) {
			cspStringParts.push(directiveRulesString);
		}
	}

	if (reportUri) {
		cspStringParts.push(getReportUriDirective(reportUri));
	}

	return cspStringParts.join(' ');
}

/**
 * Build directive rules part of CSP header value
 */
function getDirectiveString(directiveName: CSPDirectiveName, directiveValue: CSPDirectiveValue): string {
	if (!directiveValue) {
		return '';
	}

	if (directiveName in BOOLEAN_DIRECTIVES) {
		return `${directiveName};`;
	}

	if (directiveName in STRING_DIRECTIVES) {
		return `${directiveName} ${directiveValue};`;
	}

	if (directiveName in LIST_DIRECTIVES) {
		let valueString = (directiveValue as CSPListDirectiveValue).join(', ');
		return `${directiveName} ${valueString};`;
	}
}

/**
 * Build report-uri directive
 */
function getReportUriDirective(reportUri: string): string {
	return `report-uri ${reportUri};`;
}

/**
 * Normalize different presets list formats to array format
 */
function normalizePresetsList(presets: CSPPreset): CSPPresetsArray {
	return Array.isArray(presets) ? presets : Object.values(presets);
}

/**
 * Merges presets to policy
 */
function applyPresets(policies: CSPPolicies, presets: CSPPresetsArray): CSPPolicies {
	let mergedPolicies: CSPPolicies = {};

	for (let preset of [policies, ...presets]) {
		for (let directiveName in preset) {
			if (!(directiveName in ALLOWED_DIRECTIVES)) {
				continue;
			}

			directiveName as keyof CSPPolicies;

			let currentRules: CSPDirectiveValue = mergedPolicies[directiveName as keyof CSPPolicies];
			let presetRules: CSPDirectiveValue = preset[directiveName as keyof CSPPolicies];

			(mergedPolicies[directiveName as keyof CSPPolicies] as CSPDirectiveValue) = mergeDirectiveRules(currentRules, presetRules, directiveName as keyof CSPPolicies);
		}
	}

	return mergedPolicies;
}

function mergeDirectiveRules(directiveValue1: CSPDirectiveValue, directiveValue2: CSPDirectiveValue, directiveName: CSPDirectiveName): CSPDirectiveValue {
	if (directiveValue1 === undefined) {
		return directiveValue2;
	}

	if (directiveValue2 === undefined) {
		return directiveValue1;
	}

	if (directiveName in LIST_DIRECTIVES) {
		return getUniqRules([
			...directiveValue1 as CSPListDirectiveValue,
			...directiveValue2 as CSPListDirectiveValue
		]);
	}

	return directiveValue2;
}

function getUniqRules(rules: CSPListDirectiveValue): CSPListDirectiveValue {
	return Array.from(new Set(rules));
}

/**
 * Build CSP nonce string
 */
export function nonce(nonceKey: string): string {
	return `'nonce-${nonceKey}'`;
}

// General values
export const NONE = "'none'";
export const SELF = "'self'";
export const INLINE = "'unsafe-inline'";
export const EVAL = "'unsafe-eval'";

// script-src values
export const STRICT_DYNAMIC = "'strict-dynamic";

// referer values
export const NO_REFERER = "'no-referer'";
export const NONE_WHEN_DOWNGRADE = "'none-when-downgrade'";
export const ORIGIN = "'origin'";
export const ORIGIN_WHEN_CROSS_ORIGIN = "'origin-when-cross-origin'";
export const UNSAFE_URL = "'unsafe-url'";

// sandbox values
export const ALLOW_FORMS = "'allow-forms'";
export const ALLOW_MODALS = "'allow-modals'";
export const ALLOW_ORIENTATION_LOCK = "'allow-orientation-lock'";
export const ALLOW_POINTER_LOCK = "'allow-pointer-lock'";
export const ALLOW_POPUPS = "'allow-popups'";
export const ALLOW_POPUPS_TO_ESACPE_SANDBOX = "'allow-popups-to-escape-sandbox'";
export const ALLOW_PRESENTATION = "'allow-presentation'";
export const ALLOW_SAME_ORIGIN = "'allow-same-origin'";
export const ALLOW_SCRIPTS = "'allow-allow-scripts'";
export const ALLOW_TOP_NAVIGATION = "'allow-top-navigation'";

const LIST_DIRECTIVES = {
	'child-src': 'child-src',
	'connect-src': 'connect-src',
	'default-src': 'default-src',
	'font-src': 'font-src',
	'form-action': 'form-action',
	'frame-ancestors': 'frame-ancestors',
	'frame-src': 'frame-src',
	'img-src': 'img-src',
	'manifest-src': 'manifest-src',
	'media-src': 'media-src',
	'object-src': 'object-src',
	'plugin-types': 'plugin-types',
	'prefetch-src': 'prefetch-src',
	'referrer': 'referrer',
	'sandbox': 'sandbox',
	'script-src': 'script-src',
	'style-src': 'style-src',
	'worker-src': 'worker-src'
};
const STRING_DIRECTIVES = {
	'base-uri': 'base-uri',
	'report-uri': 'report-uri'
};
const BOOLEAN_DIRECTIVES = {
	'block-all-mixed-content': 'block-all-mixed-content',
	'upgrade-insecure-requests': 'upgrade-insecure-requests',
};

export const ALLOWED_DIRECTIVES = {
	...LIST_DIRECTIVES,
	...STRING_DIRECTIVES,
	...BOOLEAN_DIRECTIVES
};

export interface CSPHeaderParams {
	policies?: CSPPolicies,
	presets?: CSPPreset,
	reportUri?: string
}

export type CSPPolicies = Partial<(
	Record<CSPListDirectiveName, CSPListDirectiveValue> |
	Record<CSPStringDirectiveName, CSPStringDirectiveValue> |
	Record<CSPBooleanDirectiveName, CSPBooleanDirectiveValue>
)>;
export type CSPDirectiveName = keyof typeof ALLOWED_DIRECTIVES;
export type CSPListDirectiveName = keyof typeof LIST_DIRECTIVES;
export type CSPStringDirectiveName = keyof typeof STRING_DIRECTIVES;
export type CSPBooleanDirectiveName = keyof typeof BOOLEAN_DIRECTIVES;
export type CSPDirectiveValue = CSPListDirectiveValue | CSPStringDirectiveValue | CSPBooleanDirectiveValue;
export type CSPListDirectiveValue = string[];
export type CSPStringDirectiveValue = string;
export type CSPBooleanDirectiveValue = boolean;
export type CSPPreset = CSPPresetsObject | CSPPresetsArray;
export type CSPPresetsObject = { [presetName: string]: CSPPolicies };
export type CSPPresetsArray = CSPPolicies[];
