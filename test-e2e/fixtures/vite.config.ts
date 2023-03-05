import { defineConfig } from "vite";
import { listFixtures } from "./list-fixtures";
import { rewritePreactVersion } from "./rewrite-preact-version";
import { loadPreactVersion } from "./load-preact-version";
import { listPreactVersions } from "./list-preact-versions";
import path from "path";
import { injectSvgSpritePlugin } from "./inject-sprite";
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
							"process.env.DEBUG": JSON.stringify(false),
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
