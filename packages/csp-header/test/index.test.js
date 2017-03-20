import test from 'ava';
import csp from '../index';

test('Empty args', t => {
	t.is(csp(), undefined);
});

test('Empty policies', t => {
	const actual = csp({
		nonce: true,
		foo: 'bar'
	});
	t.is(actual, undefined);
});

test('Disallowed policies', t => {
	const actual = csp({
		policies: {
			'script-src': [ 'test.com', csp.SELF ],
			'foo-bar-src': [ 'foo', 'bar' ]
		}
	});
	const expected = "script-src test.com 'self';";
	t.is(actual, expected);
});

test('report-uri', t => {
	const actual = csp({
		policies: {
			'script-src': [ csp.SELF ]
		},
		'report-uri': 'https://test.com/cspreport'
	})
	const expected = "script-src 'self'; report-uri https://test.com/cspreport;";
	t.is(actual, expected);
});

test('Valueless directives', t => {
	const actualTrue = csp({
		policies: {
			'script-src': ['test.com'],
			'block-all-mixed-content': true
		}
	});

	const actualEmptyArray = csp({
		policies: {
			'script-src': ['test.com'],
			'block-all-mixed-content': []
		}
	});

	const actualEmptyString = csp({
		policies: {
			'script-src': ['test.com'],
			'block-all-mixed-content': ''
		}
	});

	const expected = 'script-src test.com; block-all-mixed-content;';

	t.is(actualTrue, expected);
	t.is(actualEmptyArray, expected);
	t.is(actualEmptyString, expected);
});

test('Nonce', t => {
	const actual = csp.nonce('vg3eer#E4gEbw34gwq3fgqGQWBWQh');
	const expected = "'nonce-vg3eer#E4gEbw34gwq3fgqGQWBWQh'"
	t.is(actual, expected);
});

test('Constants', t => {
	t.is(csp.SELF, "'self'");
	t.is(csp.INLINE, "'unsafe-inline'");
	t.is(csp.EVAL, "'unsafe-eval'");
	t.is(csp.NONE, "'none'");
});