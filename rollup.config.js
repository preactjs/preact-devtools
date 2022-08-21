import typescript from "rollup-plugin-typescript2";
import babel from "@rollup/plugin-babel";
import copy from "rollup-plugin-copy";
import resolve from "@rollup/plugin-node-resolve";
import postcss from "rollup-plugin-postcss";
import commonjs from "@rollup/plugin-commonjs";
import replace from "@rollup/plugin-replace";
import alias from "@rollup/plugin-alias";
import path from "path";
import fs from "fs";

const BROWSERS = ["chrome", "edge", "firefox", "inline"].filter(x => {
	if (process.env.BROWSER) {
		return process.env.BROWSER === x;
	}
	return true;
});

if (BROWSERS.length === 0 && process.env.BROWSER) {
	BROWSERS.push(process.env.BROWSER);
}

const entries = BROWSERS.map(browser => {
	const dist =
		browser === "test" ? `test-e2e/fixtures/extension` : `dist/${browser}`;

	if (browser === "inline" || browser === "test") {
		const pkg = fs.readFileSync(path.join(__dirname, "package.json"), "utf-8");
		const pkgJson = JSON.parse(pkg);
		const external =
			browser === "inline"
				? Array.from(
						new Set([
							"preact/hooks", // Not sure why we need this
							...Object.keys(pkgJson.dependencies),
							...Object.keys(pkgJson.peerDependencies),
						]),
				  )
				: [];

		return [
			{
				dist: `${dist}/setup.js`,
				entry: "src/shells/inline/index.ts",
				external,
			},
			{
				dist: `${dist}/installHook.js`,
				entry: "src/shells/shared/installHook.ts",
				external,
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
		format: BROWSERS.length === 1 && BROWSERS[0] === "inline" ? "es" : "iife",
	},
	external: data.external || [],
	plugins: [
		typescript({
			cacheRoot: "./node_modules/.cache/rts2",
		}),
		babel({
			babelrc: false,
			babelHelpers: "bundled",
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
		process.env.DEBUG === "true" &&
			alias({
				entries: [
					{
						find: "preact/hooks",
						replacement: "./node_modules/preact/hooks/src/index.js",
					},
					{ find: "preact", replacement: "./node_modules/preact/src/index.js" },
				],
			}),
		resolve(),
		commonjs(),
		replace({
			preventAssignment: true,
			values: {
				"process.env.DEBUG": process.env.DEBUG === "true",
			},
		}),
		data.copy &&
			copy({
				targets: Object.keys(data.copy).map(x => ({
					src: x,
					dest: data.copy[x],
				})),
			}),
		postcss({
			autoModules: true,
			extract: true,
		}),
	].filter(Boolean),
}));
