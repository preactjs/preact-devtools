import typescript from "rollup-plugin-typescript2";
import copy from "rollup-plugin-copy";
import resolve from "rollup-plugin-node-resolve";
import postcss from "rollup-plugin-postcss";
import commonjs from "rollup-plugin-commonjs";
import replace from "@rollup/plugin-replace";
import packageJson from "./package.json";

const BROWSERS = ["chrome", "firefox"].filter(x => {
	if (process.env.BROWSER) {
		return process.env.BROWSER === x;
	}
	return true;
});

const entries = BROWSERS.map(browser => {
	const dist = `dist/${browser}`;
	return [
		{
			entry: "src/shells/shared/index.ts",
			dist: `${dist}/index.js`,
			copy: {
				[`src/shells/${browser}/manifest.json`]: dist,
				"src/shells/shared/devtools.html": dist,
				"src/shells/shared/panel.html": dist,
				"src/shells/shared/icons": dist,
				"src/shells/shared/popup": dist,
			},
		},
		{
			dist: `${dist}/panel.js`,
			entry: "src/shells/shared/panel.ts",
		},
		{
			dist: `${dist}/background.js`,
			entry: "src/shells/shared/background.ts",
		},
		{
			dist: `${dist}/content-script.js`,
			entry: "src/shells/shared/content-script.ts",
		},
		{
			dist: `${dist}/initClient.js`,
			entry: "src/shells/shared/initClient.ts",
		},
		{
			dist: `${dist}/installHook.js`,
			entry: "src/shells/shared/installHook.ts",
		},
	];
}).reduce((acc, item) => acc.concat(item), []);

// Inline devtools
if (!process.env.BROWSER) {
	entries.push(
		{
			entry: "src/shells/inline/index.ts",
			dist: "dist/inline/setup.js",
		},
		{
			entry: "src/shells/inline/renderer.ts",
			dist: "dist/inline/renderer.js",
			external: ["preact"],
		},
	);
}

export default entries.map(data => ({
	input: data.entry,
	output: {
		file: data.dist,
		name: "index.js",
		format: "iife",
	},
	external: data.external || [],
	plugins: [
		typescript({
			cacheRoot: "./node_modules/.cache/rts2",
			objectHashIgnoreUnknownHack: true,
		}),
		resolve(),
		commonjs(),
		data.copy &&
			copy({
				targets: Object.keys(data.copy).map(x => ({
					src: x,
					dest: data.copy[x],
				})),
			}),
		postcss({
			modules: true,
			extract: true,
		}),
		replace({ __PREACT_DEVTOOLS_VERSION__: packageJson.version }),
	].filter(Boolean),
}));
