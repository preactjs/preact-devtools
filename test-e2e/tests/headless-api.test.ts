import { expect, test } from "@playwright/test";
import path from "node:path";

const source = "/@fs" + path.resolve(import.meta.dirname, "../../src");

for (const version of ["10.29.8", "11.2.0"]) {
	test(`Headless API reads and observes Preact ${version} without a panel`, async ({
		page,
	}) => {
		const moduleId = version.replace(/\./g, "_");
		await page.route("**/headless-api", route =>
			route.fulfill({
				contentType: "text/html",
				body: `<!doctype html><div id="app"></div><script type="module">
				import { createDevtoolsApi } from "${source}/api/index.ts";
				import { createHook } from "${source}/adapter/hook.ts";
				import { createPortForHook } from "${source}/adapter/adapter/port.ts";
				const hook = createHook(createPortForHook(window));
				window.__PREACT_DEVTOOLS__ = hook;
				const api = createDevtoolsApi(hook);
				const events = [];
				const off = api.on("*", event => events.push(event));
				const { h, render, options, Fragment, Component } = await import("/@id/preact@${moduleId}");
				const { useState } = await import("/@id/preact@${moduleId}/hooks");
				const renderer = hook.attachPreact("${version}", options, { Fragment, Component });
				let renders = 0;
				function App(props) {
					renders++;
					useState(0);
					return h("p", null, props.label);
				}
				const update = label => render(h(App, { label }), document.getElementById("app"));
				update("first");
				window.probe = { api, hook, renderer, update, events, off, get renders() { return renders; } };
			</script>`,
			}),
		);
		await page.goto("http://localhost:8100/headless-api");
		await page.waitForFunction(() => !!(window as any).probe);
		const first = await page.evaluate(() => {
			const { api, renderer } = (window as any).probe;
			const tree = api.getTree(renderer);
			const app = tree.nodes.find((node: any) => node.name === "App");
			return {
				capabilities: api.getRenderers(),
				events: (window as any).probe.events,
				revision: tree.revision,
				names: tree.nodes.map((node: any) => node.name),
				inspection: api.inspect(renderer, app.id),
				renders: (window as any).probe.renders,
			};
		});
		expect(first.capabilities).toEqual([
			{ id: 1, tree: true, inspect: true, commits: true },
		]);
		expect(first.names).toEqual(["Fragment", "App", "p", "#text"]);
		expect(first.inspection.value.props).toEqual({ label: "first" });
		expect(first.renders).toBe(1);
		expect(first.revision).toBe(1);
		expect(first.events.map((e: any) => e.type)).toEqual([
			"renderer-attached",
			"commit",
		]);
		await expect(page.locator("iframe")).toHaveCount(0);
		const second = await page.evaluate(async () => {
			const { api, renderer, update } = (window as any).probe;
			update("second");
			await Promise.resolve();
			const tree = api.getTree(renderer);
			const app = tree.nodes.find((node: any) => node.name === "App");
			return {
				names: tree.nodes.map((node: any) => node.name),
				inspection: api.inspect(renderer, app.id),
				renders: (window as any).probe.renders,
				events: (window as any).probe.events,
				revision: tree.revision,
			};
		});
		expect(second.names).toEqual(first.names);
		expect(second.inspection.value.props).toEqual({ label: "second" });
		expect(second.renders).toBe(2);
		expect(second.revision).toBe(2);
		expect(second.events[second.events.length - 1]).toMatchObject({
			type: "commit",
			revision: 2,
		});
		const end = await page.evaluate(async () => {
			const { api, hook, renderer, events, off, update } = (window as any)
				.probe;
			hook.detach(renderer);
			await Promise.resolve();
			const count = events.length;
			off();
			update("after detach");
			await Promise.resolve();
			return { count, events, tree: api.getTree(renderer) };
		});
		expect(end.tree).toBeNull();
		expect(end.events).toHaveLength(end.count);
		expect(end.events[end.events.length - 1]).toMatchObject({
			type: "renderer-detached",
			rendererId: 1,
		});
	});
}
