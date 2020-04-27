import typescript from "rollup-plugin-typescript2";
import babel from "rollup-plugin-babel";
import copy from "rollup-plugin-copy";
import resolve from "rollup-plugin-node-resolve";
import postcss from "rollup-plugin-postcss";
import commonjs from "rollup-plugin-commonjs";
import replace from "@rollup/plugin-replace";
import path from "path";

const BROWSERS = ["chrome", "edge", "firefox", "inline"].filter(x => {
	if (process.env.BROWSER) {
		return process.env.BROWSER === x;
	}
	return true;
});

const entries = BROWSERS.map(browser => {
	const dist = `dist/${browser}`;

	if (browser === "inline") {
		return [
			{
				dist: `${dist}/setup.js`,
				entry: "src/shells/inline/index.ts",
			},
			{
				dist: `${dist}/installHook.js`,
				entry: "src/shells/shared/installHook.ts",
			},
		];
	}
	return [
		{
			dist: `${dist}/panel/panel.js`,
			entry: "src/shells/shared/panel/panel.ts",
			copy: {
				[`src/shells/${browser}/manifest.json`]: dist,
				"src/shells/shared/panel/empty-panel.html": path.join(dist, "panel"),
				"src/shells/shared/panel/panel.html": path.join(dist, "panel"),
				"src/shells/shared/icons": dist,
				"src/shells/shared/popup/enabled.html": path.join(dist, "popup"),
				"src/shells/shared/popup/disabled.html": path.join(dist, "popup"),
			},
		},
		{
			dist: `${dist}/background/background.js`,
			entry: "src/shells/shared/background/background.ts",
		},
		{
			dist: `${dist}/content-script.js`,
			entry: "src/shells/shared/content-script.ts",
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

const camelCase = str => str.replace(/-(\w)/g, (_, x) => x.toUpperCase());

export default entries.map(data => ({
	input: data.entry,
	output: {
		file: data.dist,
		name: camelCase(path.basename(data.dist, path.extname(data.dist))),
		format: "iife",
	},
	external: data.external || [],
	plugins: [
		typescript({
			cacheRoot: "./node_modules/.cache/rts2",
		}),
		babel({
			babelrc: false,
			extensions: [".ts", ".tsx", ".js", ".jsx"],
			plugins: [
				[
					"babel-plugin-transform-jsx-to-htm",
					{
						tag: "$$html",
						import: {
							module: "htm/preact",
							export: "html",
						},
					},
				],
			],
		}),
		{
			name: "moduleDebugPlugin",
			transform(code, id) {
				if (!/\.(jsx|js|tsx|ts)$/.test(id)) return;

				const debugPath = path.relative(__dirname, id).replace(/\\/g, "/");
				const comment = `// MODULE: ${debugPath}\n`;
				return comment + code;
			},
		},
		resolve(),
		commonjs(),
		replace({
			"process.env.DEBUG": !!process.env.DEBUG,
		}),
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
