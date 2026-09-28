import { defineConfig } from "vitest/config";

export default defineConfig({
	define: {
		__DEBUG__: "false",
	},
	oxc: {
		jsx: {
			importSource: "preact",
		},
	},
	test: {
		include: ["src/**/*.test.{ts,tsx}"],
		environment: "jsdom",
		globals: true,
		isolate: false,
		setupFiles: ["./tools/vitest-setup.ts"],
	},
});
