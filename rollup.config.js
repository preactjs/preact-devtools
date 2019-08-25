import typescript from "rollup-plugin-typescript2";
import copy from "rollup-plugin-copy";
import resolve from "rollup-plugin-node-resolve";
import postcss from "rollup-plugin-postcss";

export default [
	{
		dist: "dist/chrome/index.js",
		entry: "src/shells/shared/index.ts",
		copy: {
			"src/shells/chrome/manifest.json": "dist/chrome/",
			"src/shells/shared/devtools.html": "dist/chrome/",
			"src/shells/shared/panel.html": "dist/chrome/",
			"src/shells/shared/icons": "dist/chrome/",
			"src/shells/shared/popup": "dist/chrome/",
		},
	},
	{
		dist: "dist/chrome/panel.js",
		entry: "src/shells/shared/panel.ts",
	},
	{
		dist: "dist/chrome/background.js",
		entry: "src/shells/shared/background.ts",
	},
	{
		dist: "dist/chrome/content-script.js",
		entry: "src/shells/shared/content-script.ts",
	},
	{
		dist: "dist/chrome/initClient.js",
		entry: "src/shells/shared/initClient.ts",
	},
	{
		dist: "dist/firefox/index.js",
		entry: "src/shells/shared/index.ts",
		copy: {
			"src/shells/firefox/manifest.json": "dist/firefox/",
			"src/shells/shared/devtools.html": "dist/firefox/",
			"src/shells/shared/panel.html": "dist/firefox/",
			"src/shells/shared/icons": "dist/firefox/",
			"src/shells/shared/popup": "dist/firefox/",
		},
	},
	{
		dist: "dist/firefox/panel.js",
		entry: "src/shells/shared/panel.ts",
	},
	{
		dist: "dist/firefox/background.js",
		entry: "src/shells/shared/background.ts",
	},
	{
		dist: "dist/firefox/content-script.js",
		entry: "src/shells/shared/content-script.ts",
	},
	{
		dist: "dist/firefox/initClient.js",
		entry: "src/shells/shared/initClient.ts",
	},
].map(data => ({
	input: data.entry,
	output: {
		file: data.dist,
		name: "index.js",
		format: "esm",
	},
	plugins: [
		typescript({
			cacheRoot: "./node_modules/.cache/rts2",
			objectHashIgnoreUnknownHack: true,
		}),
		resolve(),
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
	].filter(Boolean),
}));
