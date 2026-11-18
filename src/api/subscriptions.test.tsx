import { h, render, options, Fragment, Component, type VNode } from "preact";
import { useState } from "preact/hooks";
import { act } from "preact/test-utils";
import { createHook } from "../adapter/hook";
import { createRenderer } from "../adapter/shared/renderer";
import { setupOptionsV10 } from "../adapter/10/options";
import { bindingsV10 } from "../adapter/10/bindings";
import { createIdMappingState } from "../adapter/shared/idMapper";
import { newProfiler } from "../adapter/adapter/profiler";
import { createDevtoolsApi } from "./index";
import type { DevtoolsEvent } from "./types";

function fixture() {
	const send = vi.fn();
	const port = { send, listen: () => {}, listenToPage: () => {} };
	const hook = createHook(port);
	const profiler = newProfiler();
	const roots = new Map<VNode, Node>();
	const config = { Fragment, Component } as any;
	const renderer = createRenderer(
		port,
		config,
		options,
		{ hooks: true, renderReasons: true },
		profiler,
		{
			type: new Set(["dom", "fragment", "root", "hoc", "textSignal"]),
			regex: [],
		},
		createIdMappingState(1, bindingsV10.getInstance),
		bindingsV10,
		roots,
		"10.29.8",
	);
	const destroy = setupOptionsV10(options, renderer, roots, config);
	return {
		hook,
		profiler,
		renderer,
		destroy,
		send,
		api: createDevtoolsApi(hook),
	};
}

describe("headless subscriptions with a live renderer", () => {
	let container: HTMLDivElement;
	let f: ReturnType<typeof fixture>;
	beforeEach(() => {
		container = document.createElement("div");
		document.body.appendChild(container);
		f = fixture();
	});
	afterEach(() => {
		render(null, container);
		for (const id of f.hook.renderers.keys()) f.hook.detach(id);
		f.destroy();
		container.remove();
	});

	it("discovers event support and observes attachment, commits and detachment without a panel", async () => {
		const events: DevtoolsEvent[] = [];
		const off = f.api.on("*", e => events.push(e));
		const id = f.hook.attach(f.renderer);
		expect(f.api.supportsEvents).toBe(true);
		expect(f.api.getRenderers()).toEqual([
			{ id, tree: true, inspect: true, commits: true },
		]);
		render(<p>first</p>, container);
		render(<p>second</p>, container);
		const tree = f.api.getTree(id)!;
		expect(tree.revision).toBe(2);
		f.hook.detach(id);
		f.hook.detach(id);
		expect(events).toEqual([]);
		await Promise.resolve();
		expect(events.map(e => e.type)).toEqual([
			"renderer-attached",
			"commit",
			"commit",
			"renderer-detached",
		]);
		expect(events[2]).toMatchObject({
			rendererId: id,
			revision: tree.revision,
		});
		expect(f.api.getTree(id)).toBeNull();
		// The detached renderer's options can still be called, but not observed through this hook.
		render(<p>detached</p>, container);
		await Promise.resolve();
		expect(events).toHaveLength(4);
		off();
	});

	it("notifies on local updates to UI-hidden nodes, including unmounts", async () => {
		const id = f.hook.attach(f.renderer);
		let update: (value: boolean) => void;
		let renders = 0;
		function App() {
			renders++;
			const [show, setShow] = useState(false);
			update = setShow;
			return show ? <span>hidden in the panel</span> : null;
		}
		const seen: number[] = [];
		const off = f.api.on("commit", e => seen.push(e.revision), {
			rendererId: id,
		});
		render(<App />, container);
		act(() => update(true));
		act(() => update(false));
		await Promise.resolve();
		expect(seen).toEqual([1, 2, 3]);
		expect(renders).toBe(3);
		expect(f.api.getTree(id)!.revision).toBe(3);
		render(null, container);
		await Promise.resolve();
		expect(seen).toEqual([1, 2, 3, 4]);
		off();
	});

	it("does not enable profiling, send messages or replay events when subscribing", async () => {
		const id = f.hook.attach(f.renderer);
		render(<p>before</p>, container);
		await Promise.resolve();
		f.send.mockClear();
		const before = { ...f.profiler };
		const listener = vi.fn();
		const off = f.api.on("*", listener);
		await Promise.resolve();
		expect(listener).not.toHaveBeenCalled();
		expect(f.send).not.toHaveBeenCalled();
		expect(f.profiler).toEqual(before);
		expect(f.api.getTree(id)!.revision).toBe(1);
		off();
	});

	it("keeps lifecycle support for renderers without a commit bridge", async () => {
		const legacy = { ...f.renderer, subscribeToCommits: undefined };
		const events: DevtoolsEvent[] = [];
		const off = f.api.on("*", e => events.push(e));
		const id = f.hook.attach(legacy);
		expect(f.api.getRenderers()[0].commits).toBe(false);
		render(<p>legacy renderer</p>, container);
		f.hook.detach(id);
		await Promise.resolve();
		expect(events.map(e => e.type)).toEqual([
			"renderer-attached",
			"renderer-detached",
		]);
		off();
	});

	it("allows a listener to update the app only after its original commit completes", async () => {
		const id = f.hook.attach(f.renderer);
		let inRender = false;
		const seen: number[] = [];
		const off = f.api.on("commit", e => {
			expect(inRender).toBe(false);
			seen.push(e.revision);
			if (e.revision === 1) render(<p>from listener</p>, container);
		});
		inRender = true;
		render(<p>initial</p>, container);
		inRender = false;
		expect(seen).toEqual([]);
		await Promise.resolve();
		await Promise.resolve();
		expect(seen).toEqual([1, 2]);
		expect(f.api.getTree(id)!.revision).toBe(2);
		off();
	});
});
