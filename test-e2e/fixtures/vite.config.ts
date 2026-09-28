import { defineConfig } from "vite";
import { listFixtures } from "./list-fixtures.js";
import { rewritePreactVersion } from "./rewrite-preact-version.js";
import { loadPreactVersion } from "./load-preact-version.js";
import { listPreactVersions } from "./list-preact-versions.js";
import path from "path";
import { injectSvgSpritePlugin } from "./inject-sprite.js";
import prefresh from "@prefresh/vite";

// https://vitejs.dev/config/
export default defineConfig({
	optimizeDeps: {
		// Virtual fixture imports aren't visible to the initial dependency scan.
		include: ["@preact/signals-core"],
		exclude: ["preact"],
	},
	plugins: [
		prefresh(),
		{
			name: "preact:config",
			config() {
				return {
					oxc: {
						jsx: {
							runtime: "classic",
							pragma: "h",
							pragmaFrag: "Fragment",
						},
					},
					define: {
						__DEBUG__: JSON.stringify(false),
					},

					resolve: {
						alias: {
							"react-dom/test-utils": "preact/test-utils",
							"react-dom": "preact/compat",
							react: "preact/compat",
							goober: path.join(import.meta.dirname, "vendor", "goober.js"),
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
