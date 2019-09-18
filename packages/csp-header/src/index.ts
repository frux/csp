import {
	ALLOWED_DIRECTIVES,
	BOOLEAN_DIRECTIVES,
	LIST_DIRECTIVES,
	STRING_DIRECTIVES
} from './constants';
import {
	CSPHeaderParams,
	CSPDirectives,
	CSPDirectiveName,
	CSPDirectiveValue,
	CSPPreset,
	CSPPresetsArray,
	CSPListDirectiveValue
} from './types';

export * from './types';
export * from './constants';

/**
 * Build CSP header value from params
 */
export function getCSP(params: CSPHeaderParams = {}): string {
	let { directives = {}, presets = {}, reportUri } = params;
	let presetsList = normalizePresetsList(presets);
	let mergedPolicies = applyPresets(directives, presetsList);

	return policyToString(mergedPolicies, reportUri);
}

/**
 * Build CSP nonce string
 */
export function nonce(nonceKey: string): string {
	return `'nonce-${nonceKey}'`;
}

/**
 * Build CSP header value from resolved policy
 */

function policyToString(directives: CSPDirectives, reportUri?: string): string {
	let cspStringParts: string[] = [];

	for (let directiveName in directives) {
		if (!directives.hasOwnProperty(directiveName)) {
			continue;
		}

		let directiveValue: CSPDirectiveValue = directives[directiveName as keyof CSPDirectives];
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
		let valueString = (directiveValue as CSPListDirectiveValue).join(' ');
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
function applyPresets(directives: CSPDirectives, presets: CSPPresetsArray): CSPDirectives {
	let mergedPolicies: CSPDirectives = {};

	for (let preset of [directives, ...presets]) {
		for (let directiveName in preset) {
			if (!(directiveName in ALLOWED_DIRECTIVES)) {
				continue;
			}

			directiveName as keyof CSPDirectives;

			let currentRules: CSPDirectiveValue = mergedPolicies[directiveName as keyof CSPDirectives];
			let presetRules: CSPDirectiveValue = preset[directiveName as keyof CSPDirectives];

			(mergedPolicies[directiveName as keyof CSPDirectives] as CSPDirectiveValue) = mergeDirectiveRules(currentRules, presetRules, directiveName as keyof CSPDirectives);
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
