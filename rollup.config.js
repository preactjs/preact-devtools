import typescript from "rollup-plugin-typescript2";
import copy from "rollup-plugin-copy";
import resolve from "rollup-plugin-node-resolve";
import postcss from "rollup-plugin-postcss";

const BROWSERS = ["chrome", "firefox"];

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

export default entries.map(data => ({
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
