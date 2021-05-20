import { defineConfig } from "vite";
import { listFixtures } from "./list-fixtures";
import { rewritePreactVersion } from "./rewrite-preact-version";
import { loadPreactVersion } from "./load-preact-version";
import { listPreactVersions } from "./list-preact-versions";

// https://vitejs.dev/config/
export default defineConfig({
	optimizeDeps: {
		exclude: ["preact"],
	},
	plugins: [
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
						minify: false,
					},

					resolve: {
						alias: {
							"react-dom/test-utils": "preact/test-utils",
							"react-dom": "preact/compat",
							react: "preact/compat",
						},
					},
				};
			},
		},
		listPreactVersions(),
		listFixtures(),
		loadPreactVersion(),
		rewritePreactVersion(),
	],
});
