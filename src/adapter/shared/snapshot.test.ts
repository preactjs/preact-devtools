import { getTreeSnapshot } from "./snapshot";
import { bindingsV10 } from "../10/bindings";
import { createIdMappingState, createVNodeId } from "./idMapper";
import type { PreactBindings } from "./bindings";

function setup(children: any[] = []) {
	const root: any = { type: "root", children };
	const ids = createIdMappingState(1, vnode => vnode);
	createVNodeId(ids, root);
	const roots = new Map([[root, document.createElement("div")]]);
	const bindings: PreactBindings<any> = {
		...bindingsV10,
		getActualChildren: vnode => vnode.children || [],
		getDisplayName: vnode => vnode.type,
		isRoot: vnode => vnode === root,
	};
	const config = { Fragment: () => null };
	return { root, roots, ids, bindings, config };
}

describe("tree snapshot traversal", () => {
	it("bounds visits through sparse child lists", () => {
		const { roots, ids, bindings, config } = setup(new Array(1000000));
		const result = getTreeSnapshot(roots, ids, bindings, config, {
			maxNodes: 1,
		});
		expect(result.nodes).toHaveLength(1);
		expect(result.truncated).toBe(true);
	});

	it("breaks malformed cycles", () => {
		const { root, roots, ids, bindings, config } = setup();
		root.children.push(root);
		expect(getTreeSnapshot(roots, ids, bindings, config)).toMatchObject({
			nodes: [{ name: "root" }],
			truncated: true,
		});
	});

	it("does not coerce object keys with application code", () => {
		const toString = vi.fn(() => {
			throw new Error("side effect");
		});
		const child = { type: "child", key: { toString } };
		const { roots, ids, bindings, config } = setup([child]);
		expect(getTreeSnapshot(roots, ids, bindings, config).nodes[1].key).toBe(
			"[Object]",
		);
		expect(toString).not.toHaveBeenCalled();
	});

	it.each([{ maxNodes: -1 }, { maxDepth: NaN }, { maxBytes: 1 }])(
		"validates limits: %j",
		options => {
			const { roots, ids, bindings, config } = setup();
			expect(() =>
				getTreeSnapshot(roots, ids, bindings, config, options),
			).toThrow(RangeError);
		},
	);
});
