import { defineConfig } from "vite";
import { listFixtures } from "./list-fixtures";
import { rewritePreactVersion } from "./rewrite-preact-version";
import { loadPreactVersion } from "./load-preact-version";
import { listPreactVersions } from "./list-preact-versions";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		{
			name: "preact:config",
			config() {
				return {
					esbuild: {
						jsxFactory: "h",
						jsxFragment: "Fragment",
						jsxInject: "",
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
