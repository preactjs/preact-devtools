import {
	unstable_createSignalBindingTree,
	type SignalDomBinding,
} from "./signal-bindings";
import type { SnapshotRenderer } from "./types";
import { byteLength } from "./serialize";

function fixture() {
	const signal = { name: "count" };
	Object.defineProperty(signal, "value", {
		get() {
			throw new Error("must not evaluate");
		},
	});
	const one = document.createElement("input");
	const two = document.createTextNode("one");
	const owner = { id: 4 as number | null, instance: {}, name: "Counter" };
	const bindings: SignalDomBinding[] = [
		{
			id: 1,
			signal,
			effect: {},
			target: one,
			kind: "property",
			property: "value",
			updates: 2,
		},
		{ id: 2, signal, effect: {}, target: two, kind: "text", updates: 3 },
	];
	const source = {
		getSnapshot: vi.fn((limit = 1000) => ({
			bindings: bindings.slice(0, limit),
			truncated: limit < bindings.length,
		})),
		subscribe: vi.fn(() => vi.fn()),
	};
	const matches = new Map([
		[one as Node, owner],
		[two, owner],
	]);
	const renderer = {
		resolveDomComponents: vi.fn(() => ({ matches, truncated: false })),
	};
	const ids = new WeakMap<object, string>();
	let next = 0;
	const identify = (value: object) => {
		if (!ids.has(value)) ids.set(value, `id${++next}`);
		return ids.get(value)!;
	};
	const target = {
		renderers: new Map<number, SnapshotRenderer>([[7, renderer]]),
	};
	return {
		source,
		matches,
		owner,
		renderer,
		target,
		bindings,
		tree: unstable_createSignalBindingTree(target, source, identify),
	};
}

describe("experimental virtual signal/binding tree", () => {
	it("groups shared signals under runtime components without exposing raw references or reading values", () => {
		const { tree, source, renderer } = fixture();
		expect(source.subscribe).not.toHaveBeenCalled();
		const result = tree.getTree();
		expect(result.nodes.map(n => [n.kind, n.parent])).toEqual([
			["component", null],
			["signal", 0],
			["binding", 1],
			["binding", 1],
		]);
		expect(result.nodes[0]).toMatchObject({
			rendererId: 7,
			nodeId: 4,
			name: "Counter",
		});
		expect(result.nodes[2]).toMatchObject({
			effectId: "id2",
			bindingKind: "property",
			property: "value",
			updates: 2,
		});
		expect(renderer.resolveDomComponents).toHaveBeenCalledTimes(1);
		expect(JSON.stringify(result)).not.toMatch(
			/target|instance|"effect"|"signal":/,
		);
	});

	it("uses one canonical signal ID across component occurrences", () => {
		const { tree, matches, bindings } = fixture();
		matches.set(bindings[1].target, { id: 5, instance: {}, name: "Other" });
		const signals = tree.getTree().nodes.filter(n => n.kind === "signal");
		expect(signals).toHaveLength(2);
		expect(signals[0].signalId).toBe(signals[1].signalId);
	});

	it("does not merge hidden components by their name or null UI ID", () => {
		const { tree, matches, bindings } = fixture();
		matches.set(bindings[0].target, {
			id: null,
			instance: {},
			name: "Hidden",
		});
		matches.set(bindings[1].target, {
			id: null,
			instance: {},
			name: "Hidden",
		});
		expect(
			tree.getTree().nodes.filter(n => n.kind === "component"),
		).toHaveLength(2);
	});

	it("leaves unresolved signals at the root instead of guessing from DOM containment", () => {
		const { tree, matches } = fixture();
		matches.clear();
		expect(tree.getTree().nodes[0]).toMatchObject({
			kind: "signal",
			parent: null,
		});
	});

	it("bounds rows and bytes while preserving parent references", () => {
		const { tree } = fixture();
		expect(tree.getTree({ maxNodes: 0 })).toEqual({
			nodes: [],
			truncated: true,
		});
		expect(tree.getTree({ maxNodes: 2 }).nodes).toHaveLength(2);
		const small = tree.getTree({ maxBytes: 128 });
		expect(byteLength(small)).toBeLessThanOrEqual(128);
		expect(small.truncated).toBe(true);
		for (let i = 0; i < small.nodes.length; i++) {
			const parent = small.nodes[i].parent;
			if (parent !== null) expect(parent).toBeLessThan(i);
		}
		expect(() => tree.getTree({ maxBytes: 5 })).toThrow(RangeError);
	});

	it("propagates resolver truncation and forwards subscriber cleanup", () => {
		const f = fixture();
		f.renderer.resolveDomComponents.mockReturnValue({
			matches: f.matches,
			truncated: true,
		});
		expect(f.tree.getTree().truncated).toBe(true);
		const callback = vi.fn();
		const off = f.tree.subscribe(callback);
		expect(f.source.subscribe).toHaveBeenCalledWith(callback);
		expect(off).toBe(f.source.subscribe.mock.results[0].value);
	});
});
