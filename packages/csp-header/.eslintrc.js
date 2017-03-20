module.exports = {
	env: {
		browser: true,
		commonjs: true,
		es6: true,
		node: true
	},
	extends: [
		'xo',
		'xo-react'
	],
	parserOptions: {
		ecmaFeatures: {
			experimentalObjectRestSpread: true,
			jsx: true
		},
		ecmaVersion:'2017',
		sourceType: 'module'
	},
	plugins: [
		'react'
	],
	ext: [
		'.js',
		'.jsx'
	],
	rules: {
		'quotes': ['error', 'single', {'avoidEscape': true}],
		'operator-linebreak': [
			'error',
			'after',
			{
				overrides: {
					'?': 'before',
					':': 'before'
				}
			}
		],
		'generator-star-spacing': ['error', 'after'],
		'react/no-danger': 0,
		'react/forbid-component-props': 0,
		'react/no-did-update-set-state': 0,
		'no-floating-decimal': 0,
		'spaced-comment': [
			'error',
			'always',
			{
				"markers": [
				":",
				"?:",
				"::"
				]
			}
		]
	}
}
