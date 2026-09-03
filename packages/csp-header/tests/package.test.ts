import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

const packageRoot = resolve(__dirname, "..");
const typescriptCli = resolve(
	packageRoot,
	"../../node_modules/typescript/bin/tsc"
);

function runNode(source: string, asModule = false): string {
	const args = asModule
		? ["--input-type=module", "--eval", source]
		: ["--eval", source];

	return execFileSync(process.execPath, args, {
		cwd: packageRoot,
		encoding: "utf8",
	});
}

describe("package entry points", () => {
	test("loads the CommonJS build through require", () => {
		expect(
			runNode(`
				const { getCSP, SELF } = require("csp-header");
				process.stdout.write(getCSP({
					directives: { "default-src": [SELF] }
				}));
			`)
		).toBe("default-src 'self';");
	});

	test("loads the native ESM build through import", () => {
		expect(
			runNode(
				`
					import { getCSP, SELF } from "csp-header";
					process.stdout.write(getCSP({
						directives: { "default-src": [SELF] }
					}));
				`,
				true
			)
		).toBe("default-src 'self';");
	});

	test("provides declarations for CommonJS and ESM consumers", () => {
		expect(() =>
			execFileSync(
				process.execPath,
				[
					typescriptCli,
					"--noEmit",
					"--strict",
					"--skipLibCheck",
					"--target",
					"ES2022",
					"--module",
					"NodeNext",
					"--moduleResolution",
					"NodeNext",
					"tests/fixtures/esm-consumer.mts",
					"tests/fixtures/commonjs-consumer.cts",
				],
				{ cwd: packageRoot, stdio: "pipe" }
			)
		).not.toThrow();
	});
});
