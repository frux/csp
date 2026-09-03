import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts"],
	format: ["cjs", "esm"],
	dts: {
		compilerOptions: {
			composite: false,
		},
	},
	sourcemap: true,
	clean: true,
	bundle: true,
	splitting: false,
	target: "es2022",
	platform: "node",
	external: ["csp-header", "psl"],
	outExtension({ format }) {
		return {
			js: format === "esm" ? ".mjs" : ".cjs",
		};
	},
});
