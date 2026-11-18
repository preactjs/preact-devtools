import { h, render, options, Fragment, Component, type VNode } from "preact";
import { useState } from "preact/hooks";
import { act } from "preact/test-utils";
import { createDevtoolsApi } from "./index";
import type { DevtoolsApi, SnapshotRenderer } from "./types";
import { createRenderer } from "../adapter/shared/renderer";
import { setupOptionsV10 } from "../adapter/10/options";
import { bindingsV10 } from "../adapter/10/bindings";
import { createIdMappingState } from "../adapter/shared/idMapper";
import { newProfiler } from "../adapter/adapter/profiler";
import type { FilterState } from "../adapter/adapter/filter";
import { byteLength } from "./serialize";

describe("headless DevTools API", () => {
	let container: HTMLDivElement;
	let api: DevtoolsApi;
	let destroy: () => void;
	let send: ReturnType<typeof vi.fn<() => void>>;
	let ids: ReturnType<typeof createIdMappingState<VNode>>;

	beforeEach(() => {
		container = document.createElement("div");
		document.body.appendChild(container);
		send = vi.fn<() => void>();
		const roots = new Map<VNode, Node>();
		const config = { Fragment, Component } as any;
		ids = createIdMappingState(1, bindingsV10.getInstance);
		const filters: FilterState = {
			regex: [],
			type: new Set(["dom", "fragment", "root", "hoc", "textSignal"]),
		};
		const renderer = createRenderer(
			{ send, listen: () => null, listenToPage: () => null },
			config,
			options,
			{ hooks: true, renderReasons: true },
			newProfiler(),
			filters,
			ids,
			bindingsV10,
			roots,
			"10.29.8",
		);
		destroy = setupOptionsV10(options, renderer, roots, config);
		api = createDevtoolsApi({ renderers: new Map([[42, renderer]]) });
	});

	afterEach(() => {
		render(null, container);
		destroy();
		container.remove();
	});

	it("reads live trees and props without rerendering, messaging, or assigning hidden-node IDs", () => {
		let renders = 0;
		function App(props: { count: number }) {
			renders++;
			useState(0);
			return <div>{props.count}</div>;
		}
		render(<App count={3} />, container);
		const nextId = ids.nextId;
		send.mockClear();

		expect(api.apiVersion).toBe(1);
		expect(api.getRenderers()).toEqual([
			{ id: 42, tree: true, inspect: true, commits: false },
		]);
		const snapshot = api.getTree(42)!;
		expect(snapshot.nodes.map(n => [n.name, n.parent, n.kind])).toEqual([
			["Fragment", null, "root"],
			["App", 0, "component"],
			["div", 1, "element"],
			["#text", 2, "text"],
		]);
		expect(snapshot.nodes[2].id).toBeNull();
		expect(snapshot.nodes[3].id).toBeNull();
		expect(api.inspect(42, snapshot.nodes[1].id!)!.value).toMatchObject({
			props: { count: 3 },
		});
		expect(renders).toBe(1);
		expect(ids.nextId).toBe(nextId);
		expect(send).not.toHaveBeenCalled();
	});

	it("reflects reordering and unmounts, and returns detached copies", () => {
		function Item({ name }: { name: string }) {
			return <p>{name}</p>;
		}
		const view = (names: string[]) => (
			<div>
				{names.map(name => (
					<Item key={name} name={name} />
				))}
			</div>
		);
		render(view(["a", "b"]), container);
		const before = api.getTree(42)!;
		const itemA = before.nodes.find(n => n.key === "a")!;
		render(view(["b", "a"]), container);
		expect(
			api
				.getTree(42)!
				.nodes.filter(n => n.name === "Item")
				.map(n => n.key),
		).toEqual(["b", "a"]);
		expect(before.nodes.filter(n => n.name === "Item").map(n => n.key)).toEqual(
			["a", "b"],
		);
		render(view(["b"]), container);
		expect(api.inspect(42, itemA.id!)).toBeNull();
		expect(api.getTree(42)!.nodes.some(n => n.key === "a")).toBe(false);
	});

	it("follows component-local updates without a root render", () => {
		let update: (value: boolean) => void;
		function App() {
			const [visible, setVisible] = useState(false);
			update = setVisible;
			return visible ? <span>visible</span> : null;
		}
		render(<App />, container);
		expect(api.getTree(42)!.nodes.some(n => n.name === "span")).toBe(false);
		act(() => update(true));
		expect(api.getTree(42)!.nodes.some(n => n.name === "span")).toBe(true);
		act(() => update(false));
		expect(api.getTree(42)!.nodes.some(n => n.name === "span")).toBe(false);
	});

	it("bounds tree depth, nodes, and UTF-8 bytes", () => {
		render(
			<div>
				<span>one</span>
				<span>two</span>
			</div>,
			container,
		);
		expect(api.getTree(42, { maxDepth: 0 })).toMatchObject({
			nodes: [{ kind: "root" }],
			truncated: true,
		});
		expect(api.getTree(42, { maxNodes: 2 })!.nodes).toHaveLength(2);
		expect(api.getTree(42, { maxNodes: 0 })).toEqual({
			nodes: [],
			truncated: true,
			revision: api.getTree(42)!.revision,
		});
		const small = api.getTree(42, { maxBytes: 128 })!;
		expect(small.truncated).toBe(true);
		expect(byteLength(small)).toBeLessThanOrEqual(128);
		for (const node of small.nodes) {
			if (node.parent !== null)
				expect(node.parent).toBeLessThan(small.nodes.length);
		}
	});

	it("does not evaluate accessors in inspected props", () => {
		function App() {
			return null;
		}
		const vnode = <App />;
		render(vnode, container);
		const getter = vi.fn(() => {
			throw new Error("side effect");
		});
		Object.defineProperty(vnode.props, "secret", {
			enumerable: true,
			get: getter,
		});
		const id = api.getTree(42)!.nodes.find(n => n.name === "App")!.id!;
		expect(api.inspect(42, id)!.value).toMatchObject({
			props: { secret: "[Getter]" },
		});
		expect(getter).not.toHaveBeenCalled();
	});

	it("does not evaluate accessors used as component state", () => {
		function App() {
			return null;
		}
		const vnode = <App />;
		render(vnode, container);
		const component = bindingsV10.getComponent(vnode)!;
		const getter = vi.fn(() => {
			throw new Error("state accessor");
		});
		Object.defineProperty(component, "state", {
			configurable: true,
			get: getter,
		});
		const id = api.getTree(42)!.nodes.find(n => n.name === "App")!.id!;
		expect(api.inspect(42, id)!.value).toMatchObject({ state: "[Getter]" });
		expect(getter).not.toHaveBeenCalled();
		Object.defineProperty(component, "state", {
			configurable: true,
			value: {},
		});
	});

	it("handles legacy, missing and detached renderers without falling back to inspect", () => {
		const legacy = { inspect: vi.fn() };
		const renderers = new Map<number, SnapshotRenderer>([
			[7, legacy as SnapshotRenderer],
		]);
		const legacyApi = createDevtoolsApi({ renderers });
		expect(legacyApi.getRenderers()).toEqual([
			{ id: 7, tree: false, inspect: false, commits: false },
		]);
		expect(legacyApi.supportsEvents).toBe(false);
		expect(() => legacyApi.on("commit", () => {})).toThrow(/does not support/);
		expect(legacyApi.getTree(7)).toBeNull();
		expect(legacyApi.inspect(7, 1)).toBeNull();
		expect(legacyApi.getTree(99)).toBeNull();
		expect(legacy.inspect).not.toHaveBeenCalled();
		renderers.delete(7);
		expect(legacyApi.getRenderers()).toEqual([]);
	});
});
