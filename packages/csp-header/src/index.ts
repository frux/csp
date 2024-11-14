import {
	ALLOWED_DIRECTIVES,
} from './constants/directives';
import {
	NONE
} from './constants/values';
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
export * from './constants/directives';
export * from './constants/values';

/**
 * Build CSP header value from params
 */
export function getCSP(params: CSPHeaderParams = {}): string {
	const { directives = {}, presets = {}, reportUri } = params;
	const presetsList = normalizePresetsList(presets);
	const mergedPolicies = applyPresets(directives, presetsList);

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

function policyToString(directives: Partial<CSPDirectives>, reportUri?: string): string {
	const cspStringParts: string[] = [];

	for (const directiveName in directives) {
		if (!directives.hasOwnProperty(directiveName)) {
			continue;
		}

		const directiveValue = directives[directiveName as keyof CSPDirectives];

		if (!directiveValue) {
			continue;
		}

		const directiveRulesString = getDirectiveString(
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
	if (typeof directiveValue === 'boolean') {
		return `${directiveName};`;
	}

	if (typeof directiveValue === 'string') {
		return `${directiveName} ${directiveValue};`;
	}

	if (Array.isArray(directiveValue)) {
		const valueString = (directiveValue as CSPListDirectiveValue).join(' ');
		return `${directiveName} ${valueString};`;
	}

	return '';
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
function applyPresets(directives: Partial<CSPDirectives>, presets: CSPPresetsArray): Partial<CSPDirectives> {
	const mergedPolicies: Partial<CSPDirectives> = {};

	for (const preset of [directives, ...presets]) {
		for (const directiveName in preset) {
			if (!(directiveName in ALLOWED_DIRECTIVES)) {
				continue;
			}

			const currentRules = mergedPolicies[directiveName as keyof CSPDirectives];
			const presetRules = preset[directiveName as keyof CSPDirectives];

			if (presetRules === undefined) {
				continue;
			}

			(mergedPolicies[directiveName as keyof CSPDirectives] as CSPDirectiveValue) = mergeDirectiveRules(currentRules, presetRules);
		}
	}

	return mergedPolicies;
}

function mergeDirectiveRules(directiveValue1: CSPDirectiveValue = '', directiveValue2: CSPDirectiveValue = ''): CSPDirectiveValue {
	if (directiveValue1 === undefined) {
		return directiveValue2;
	}

	if (directiveValue2 === undefined) {
		return directiveValue1;
	}

	if (Array.isArray(directiveValue1) && Array.isArray(directiveValue2)) {
		const uniqRules =  getUniqRules([
			...directiveValue1,
			...directiveValue2
		]);

		const noneIndex = uniqRules.indexOf(NONE);
		// Remove "'none'" if there are other rules
		if(noneIndex >= 0 && uniqRules.length > 1) {
			uniqRules.splice(noneIndex, 1);
		}

		return uniqRules;
	}

	return directiveValue2;
}

function getUniqRules(rules: CSPListDirectiveValue): CSPListDirectiveValue {
	return Array.from(new Set(rules));
}
