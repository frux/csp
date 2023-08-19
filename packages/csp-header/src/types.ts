import {
	ALLOW_DOWNLOADS_WITHOUT_USER_ACTIVATION,
	ALLOW_DUPLICATES,
	ALLOW_FORMS,
	ALLOW_MODALS,
	ALLOW_ORIENTATION_LOCK,
	ALLOW_POINTER_LOCK,
	ALLOW_POPUPS,
	ALLOW_POPUPS_TO_ESCAPE_SANDBOX,
	ALLOW_PRESENTATION,
	ALLOW_SAME_ORIGIN,
	ALLOW_STORAGE_ACCESS_BY_USER_ACTIVATION,
	ALLOW_SCRIPTS,
	ALLOW_TOP_NAVIGATION,
	ALLOW_TOP_NAVIGATION_BY_USER_ACTIVATION,
	NO_REFERRER,
	NONE,
	NONE_WHEN_DOWNGRADE,
	ORIGIN,
	ORIGIN_WHEN_CROSS_ORIGIN,
	SCRIPT,
	SELF,
	STRICT_DYNAMIC,
	UNSAFE_EVAL,
	UNSAFE_HASHES,
	UNSAFE_INLINE,
	UNSAFE_URL,
    ALLOW,
    BLOCK,
    REPORT_SAMPLE,
    WASM_UNSAFE_EVAL,
} from './constants/values';

export interface CSPHeaderParams {
	directives?: Partial<CSPDirectives>,
	presets?: CSPPreset,
	reportUri?: string
}

type DirectivesOfType<T> = { [K in keyof CSPDirectives]: CSPDirectives[K] extends T ? K : never } extends Record<string, infer P> ? P : never;
export type CSPDirectiveName = DirectivesOfType<any>;
export type CSPListDirectiveName = DirectivesOfType<CSPListDirectiveValue>;
export type CSPStringDirectiveName = DirectivesOfType<CSPStringDirectiveValue>;
export type CSPBooleanDirectiveName = DirectivesOfType<CSPBooleanDirectiveValue>;
export type CSPDirectiveValue = CSPListDirectiveValue | CSPStringDirectiveValue | CSPBooleanDirectiveValue;
export type CSPListDirectiveValue = string[];
export type CSPStringDirectiveValue = string;
export type CSPBooleanDirectiveValue = boolean;
export type CSPPreset = CSPPresetsObject | CSPPresetsArray;
export type CSPPresetsObject = { [presetName: string]: Partial<CSPDirectives> };
export type CSPPresetsArray = Partial<CSPDirectives>[];

type TSource = string;
type TNonce = `nonce-${string}`;
type THash = `sha${'256' | '384' | '512'}-${string}`;
type TMimeType = `${string}/${string}`;

type TFetchDirective = TSource |
	TNonce |
	THash |
	typeof NONE |
	typeof SELF |
	typeof UNSAFE_EVAL |
	typeof UNSAFE_HASHES |
	typeof UNSAFE_INLINE;

type TAttrDirective = THash |
	typeof NONE |
	typeof UNSAFE_INLINE |
	typeof UNSAFE_HASHES;

type TDocumentDirective = TSource |
	TNonce |
	THash |
	typeof NONE |
	typeof SELF |
	typeof UNSAFE_EVAL |
	typeof UNSAFE_HASHES |
	typeof UNSAFE_INLINE;

type TNavigationDirective = TSource |
	TNonce |
	THash |
	typeof NONE |
	typeof SELF |
	typeof UNSAFE_EVAL |
	typeof UNSAFE_HASHES |
	typeof UNSAFE_INLINE |
	typeof STRICT_DYNAMIC;

type TWebRTCDirective = typeof ALLOW | typeof BLOCK;

export type CSPDirectives = {
	'base-uri': (TDocumentDirective | typeof STRICT_DYNAMIC)[],
	'block-all-mixed-content': boolean,
	'child-src': TFetchDirective[],
	'connect-src': TFetchDirective[],
	'default-src': (TFetchDirective | typeof STRICT_DYNAMIC)[],
	'font-src': TFetchDirective[],
	'form-action': TNavigationDirective[],
	'frame-ancestors': (TSource | typeof SELF | typeof NONE)[],
	'frame-src': TFetchDirective[],
	'img-src': (TFetchDirective | typeof STRICT_DYNAMIC)[],
	'manifest-src': TFetchDirective[],
	'media-src': TFetchDirective[],
	'navigate-to': TNavigationDirective[],
	'object-src': TFetchDirective[],
	'plugin-types': TMimeType[],
	'prefetch-src': TFetchDirective[],
	'referrer': typeof NO_REFERRER |
		typeof NONE_WHEN_DOWNGRADE |
		typeof ORIGIN |
		typeof ORIGIN_WHEN_CROSS_ORIGIN |
		typeof UNSAFE_URL,
	'report-to': string,
	'report-uri': string,
	'require-sri-for': ('script' | 'style')[],
	'require-trusted-types-for': typeof SCRIPT,
	'sandbox': (typeof ALLOW_DOWNLOADS_WITHOUT_USER_ACTIVATION |
		typeof ALLOW_FORMS |
		typeof ALLOW_MODALS |
		typeof ALLOW_ORIENTATION_LOCK |
		typeof ALLOW_POINTER_LOCK |
		typeof ALLOW_POPUPS |
		typeof ALLOW_POPUPS_TO_ESCAPE_SANDBOX |
		typeof ALLOW_PRESENTATION |
		typeof ALLOW_SAME_ORIGIN |
		typeof ALLOW_SCRIPTS |
		typeof ALLOW_STORAGE_ACCESS_BY_USER_ACTIVATION |
		typeof ALLOW_TOP_NAVIGATION |
		typeof ALLOW_TOP_NAVIGATION_BY_USER_ACTIVATION)[],
	'script-src': (TFetchDirective | typeof STRICT_DYNAMIC | typeof REPORT_SAMPLE | typeof WASM_UNSAFE_EVAL)[],
	'script-src-attr': (TAttrDirective | typeof REPORT_SAMPLE)[],
	'script-src-elem': (TFetchDirective | typeof STRICT_DYNAMIC | typeof REPORT_SAMPLE)[],
	'style-src': (TFetchDirective[] | typeof REPORT_SAMPLE),
	'style-src-attr': (TAttrDirective | typeof REPORT_SAMPLE)[],
	'style-src-elem': (TFetchDirective | typeof REPORT_SAMPLE)[],
	'trusted-types': (string | typeof NONE | typeof ALLOW_DUPLICATES)[],
	'upgrade-insecure-requests': boolean,
	'worker-src': TFetchDirective[],
	'webrtc': TWebRTCDirective,
};
