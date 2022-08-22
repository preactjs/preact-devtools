import * as esbuild from "esbuild";
import path from "path";
import {
	aliasPlugin,
	archivePlugin,
	babelPlugin,
	copyPlugin,
	cssModules,
	inlinePlugin,
	renamePlugin,
	spritePlugin,
	gitSourcePlugin,
} from "./build-plugins/esbuild-plugins.mjs";
import * as fsExtra from "fs-extra";
import mri from "mri";
import * as kl from "kolorist";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const args = mri(process.argv.slice(2), {
	string: ["browser"],
	boolean: ["debug", "help", "watch"],
	alias: {
		d: "debug",
		b: "browser",
		w: "watch",
		h: "help",
	},
});

const BROWSERS = ["chrome", "edge", "firefox", "inline", "foo"];

if (args.help || Object.keys(args).length === 1) {
	const list = BROWSERS.join(", ");
	// eslint-disable-next-line no-console
	console.log(`Build Preact DevTools extension.

Options:
  -d, --debug    Include debug output in build
  -b, --browser  The browser or list of browsers to build for (${list})
  -w, --watch    Rebuild on file system changes
  -h, --help     Display this text
`);
	process.exit(0);
}

const browsers = (args.browser || "").split(",");
if (browsers.length === 0) {
	// eslint-disable-next-line no-console
	console.error(`Missing required argument: --browser`);
	process.exit(1);
}
const DEBUG = !!args.debug;

async function run() {
	browsers.forEach(browser => {
		if (!BROWSERS.includes(browser)) {
			// eslint-disable-next-line no-console
			console.error(
				`Unknown browser: "${browser}". Expected one of: ${BROWSERS.join(
					", ",
				)}`,
			);
			process.exit(1);
		}
	});

	// Run in sequence to not make output confusing
	let i = 0;
	for (const browser of browsers) {
		if (i++ > 0) {
			// eslint-disable-next-line no-console
			console.log();
		}
		await build(browser);
	}
}
run();

async function build(browser) {
	const dist = `dist/${browser}`;
	// eslint-disable-next-line no-console
	console.log(`${kl.dim("Browser:")} ${kl.cyan(browser)}`);
	const start = Date.now();

	await fsExtra.remove(dist);

	await esbuild.build({
		bundle: true,
		sourcemap: false,
		outdir: dist,
		watch: args.watch,
		define: {
			"process.env.DEBUG": DEBUG,
		},
		entryPoints: {
			"panel/panel": "src/shells/shared/panel/panel.ts",
			"background/background": "src/shells/shared/background/background.ts",
			"content-script": "src/shells/shared/content-script.ts",
			installHook: "src/shells/shared/installHook.ts",
		},
		plugins: [
			DEBUG
				? aliasPlugin({
						"preact/hooks": "./node_modules/preact/hooks/src/index.js",
						preact: "./node_modules/preact/src/index.js",
				  })
				: undefined,
			cssModules(),
			babelPlugin(),
			copyPlugin({
				[`src/shells/${browser}/manifest.json`]: dist,
				"src/shells/shared/panel/empty-panel.html": path.join(dist, "panel"),
				"src/shells/shared/panel/panel.html": path.join(dist, "panel"),
				"src/shells/shared/icons": dist,
				"src/shells/shared/popup/enabled.html": path.join(dist, "popup"),
				"src/shells/shared/popup/disabled.html": path.join(dist, "popup"),
			}),
			renamePlugin({
				[`${dist}/installHook.css`]: `${dist}/preact-devtools-page.css`,
			}),
			inlinePlugin(dist),
			spritePlugin(
				path.join(__dirname, "..", "src", "view", "sprite.svg"),
				dist,
			),
			archivePlugin("dist", browser),
			gitSourcePlugin(),
		].filter(Boolean),
	});

	const time = kl.green(`${Date.now() - start}ms`);
	// eslint-disable-next-line no-console
	console.log(`${kl.dim("Time:")} ${time}`);
}