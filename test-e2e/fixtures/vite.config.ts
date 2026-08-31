import { defineConfig } from "vite";
import { listFixtures } from "./list-fixtures.ts";
import { rewritePreactVersion } from "./rewrite-preact-version.ts";
import { loadPreactVersion } from "./load-preact-version.ts";
import { listPreactVersions } from "./list-preact-versions.ts";
import path from "path";
import { injectSvgSpritePlugin } from "./inject-sprite.ts";
import prefresh from "@prefresh/vite";

// https://vitejs.dev/config/
export default defineConfig({
	optimizeDeps: {
		exclude: ["preact"],
		include: ["@preact/signals-core"],
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
