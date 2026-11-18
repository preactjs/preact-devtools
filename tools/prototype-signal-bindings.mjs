/* eslint-disable no-console */
// Cross-checkout experiment: node tools/prototype-signal-bindings.mjs /path/to/preact-signals
import { build } from "esbuild";
import { chromium } from "@playwright/test";
import { createRequire } from "node:module";
import path from "node:path";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL("../", import.meta.url));
if (!process.argv[2]) throw new Error("Pass the signals checkout path");
const signals = path.resolve(process.argv[2]);
const preactVersion = require("preact/package.json").version;
const preact = path.dirname(require.resolve("preact/package.json"));
const { outputFiles } = await build({
	stdin: {
		resolveDir: root,
		contents: `
		import { h, render, options, Fragment, Component } from "preact";
		import { createPortal } from "preact/compat";
		import { signal, unstable_startDomBindingTracking } from ${JSON.stringify(path.join(signals, "packages/preact/src/index.ts"))};
		import { getSignalId } from ${JSON.stringify(path.join(signals, "packages/debug/src/utils.ts"))};
		import { createHook } from "./src/adapter/hook.ts";
		import { createDevtoolsApi, unstable_createSignalBindingTree } from "./src/api/index.ts";
		const source = unstable_startDomBindingTracking();
		const hook = createHook({send(){}, listen(){}, listenToPage(){}});
		const rendererId = hook.attachPreact(${JSON.stringify(preactVersion)}, options, { Fragment, Component });
		const api = createDevtoolsApi(hook);
		const tree = unstable_createSignalBindingTree(hook, source, getSignalId);
		const count = signal("one", { name: "count" });
		const other = signal("other", { name: "other" });
		const commits = [];
		api.on("commit", e => commits.push(e));
		const container = document.getElementById("app");
		const portal = document.getElementById("portal");
		let renders = 0;
		function PortalChild({value}) { return h("input", {value}); }
		function App({ value, portalMode }) {
			renders++;
			return h("section", null, h("span", null, value),
				portalMode ? createPortal(h(PortalChild, { value }), portal) : h("input", { value }));
		}
		const update = (value = count, portalMode = false) => render(h(App, { value, portalMode }), container);
		const unmount = () => render(null, container);
		update();
		window.probe = { source, tree, count, other, update, unmount, commits,
			get renders() { return renders; }, signalId: getSignalId(count) };
	`,
	},
	bundle: true,
	write: false,
	format: "iife",
	platform: "browser",
	loader: { ".css": "empty", ".module.css": "empty" }, // No panel or highlighting UI is mounted.
	define: { __DEBUG__: "false", "process.env.NODE_ENV": '"development"' },
	alias: {
		preact: path.join(preact, "dist/preact.module.js"),
		"preact/hooks": path.join(preact, "hooks/dist/hooks.module.js"),
		"preact/compat": path.join(preact, "compat/dist/compat.module.js"),
		"preact/jsx-runtime": path.join(
			preact,
			"jsx-runtime/dist/jsxRuntime.module.js",
		),
		"@preact/signals-core": path.join(signals, "packages/core/src/index.ts"),
		"@preact/signals": path.join(signals, "packages/preact/src/index.ts"),
	},
});
const browser = await chromium.launch({ headless: true });
try {
	const page = await browser.newPage();
	const errors = [];
	page.on("pageerror", error => {
		errors.push(error.message);
		console.error(error);
	});
	await page.route("http://prototype.test/**", route =>
		route.fulfill(
			route.request().url().endsWith("bundle.js")
				? { contentType: "text/javascript", body: outputFiles[0].text }
				: {
						contentType: "text/html",
						body: '<div id="app"></div><div id="portal"></div><script src="/bundle.js"></script>',
					},
		),
	);
	await page.goto("http://prototype.test/");
	await page.waitForFunction(() => !!window.probe, null, { timeout: 5000 });
	const initial = await page.evaluate(() => {
		const p = window.probe;
		return {
			...p.tree.getTree(),
			renders: p.renders,
			commits: p.commits.length,
			signalId: p.signalId,
		};
	});
	assert.equal(initial.nodes.filter(n => n.kind === "binding").length, 2);
	assert.deepEqual(
		[
			...new Set(
				initial.nodes.filter(n => n.kind === "signal").map(n => n.signalId),
			),
		],
		[initial.signalId],
	);
	assert(initial.nodes.some(n => n.kind === "component" && n.name === "App"));
	const updated = await page.evaluate(async () => {
		const p = window.probe;
		p.count.value = "two";
		await new Promise(resolve => setTimeout(resolve, 0));
		return {
			...p.tree.getTree(),
			renders: p.renders,
			commits: p.commits.length,
			text: document.querySelector("span").textContent,
			input: document.querySelector("input").value,
		};
	});
	assert.equal(updated.renders, initial.renders);
	assert.equal(updated.commits, initial.commits);
	assert.equal(updated.text, "two");
	assert.equal(updated.input, "two");
	assert(
		updated.nodes.filter(n => n.kind === "binding").every(n => n.updates === 1),
	);
	const rebound = await page.evaluate(async () => {
		const p = window.probe;
		p.update(p.other, true);
		await new Promise(resolve => setTimeout(resolve, 0));
		return p.tree.getTree();
	});
	assert.equal(rebound.nodes.filter(n => n.kind === "binding").length, 2);
	const property = rebound.nodes.find(
		n => n.kind === "binding" && n.bindingKind === "property",
	);
	const signalNode = rebound.nodes[property.parent];
	const owner = rebound.nodes[signalNode.parent];
	assert.equal(
		owner.name,
		"PortalChild",
		"Portal attribution must follow runtime ancestry, not DOM ancestry",
	);
	const end = await page.evaluate(() => {
		const p = window.probe;
		p.unmount();
		const tree = p.tree.getTree();
		p.source.dispose();
		return tree;
	});
	assert.deepEqual(end.nodes, []);
	assert.deepEqual(errors, []);
	console.log(
		"Cross-checkout prototype passed: replay, shared signal identity, direct text/prop writes without commits, portal attribution, rebinding and unmount cleanup.",
	);
	console.log(JSON.stringify(updated.nodes, null, 2));
} finally {
	await browser.close();
}
