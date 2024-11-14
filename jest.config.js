// @ts-check

/**
 * @type {import('jest').Config}
 */
module.exports = {
	testMatch: ['<rootDir>/tests/*.test.ts'],
	transform: {
		'^.+\\.ts$': 'ts-jest'
	},
}
