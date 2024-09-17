import { defineConfig } from "vite";
import { listFixtures } from "./list-fixtures.ts";
import { rewritePreactVersion } from "./rewrite-preact-version.ts";
import { loadPreactVersion } from "./load-preact-version.ts";
import { listPreactVersions } from "./list-preact-versions.ts";
import path from "node:path";
import { injectSvgSpritePlugin } from "./inject-sprite.ts";
import prefresh from "@prefresh/vite";

// https://vitejs.dev/config/
export default defineConfig({
	optimizeDeps: {
		exclude: ["preact"],
	},
	plugins: [
		prefresh(),
		{
			name: "preact:config",
			config() {
				return {
					esbuild: {
						jsxFactory: "h",
						jsxFragment: "Fragment",
						jsxInject: "",
						define: {
							__DEBUG__: JSON.stringify(false),
						},
					},

					resolve: {
						alias: {
							"react-dom/test-utils": "preact/test-utils",
							"react-dom": "preact/compat",
							react: "preact/compat",
							goober: path.join(__dirname, "vendor", "goober.js"),
						},
					},
				};
			},
		},
		listPreactVersions(),
		listFixtures(),
		loadPreactVersion(),
		rewritePreactVersion(),
		injectSvgSpritePlugin(),
	],
});
