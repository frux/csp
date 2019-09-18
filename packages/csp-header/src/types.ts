import { ALLOWED_DIRECTIVES, BOOLEAN_DIRECTIVES, LIST_DIRECTIVES, STRING_DIRECTIVES } from './constants';

export interface CSPHeaderParams {
	directives?: CSPDirectives,
	presets?: CSPPreset,
	reportUri?: string
}

export type CSPDirectives = Partial<(
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
export type CSPPresetsObject = { [presetName: string]: CSPDirectives };
export type CSPPresetsArray = CSPDirectives[];
