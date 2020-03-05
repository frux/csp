// General values
export const NONE = "'none'";
export const SELF = "'self'";
export const INLINE = "'unsafe-inline'";
export const EVAL = "'unsafe-eval'";
export const DATA = 'data:';
export const BLOB = 'blob:';

// script-src values
export const STRICT_DYNAMIC = "'strict-dynamic'";

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

export const LIST_DIRECTIVES = {
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
export const STRING_DIRECTIVES = {
	'base-uri': 'base-uri',
	'report-uri': 'report-uri'
};
export const BOOLEAN_DIRECTIVES = {
	'block-all-mixed-content': 'block-all-mixed-content',
	'upgrade-insecure-requests': 'upgrade-insecure-requests',
};

export const ALLOWED_DIRECTIVES = {
	...LIST_DIRECTIVES,
	...STRING_DIRECTIVES,
	...BOOLEAN_DIRECTIVES
};
