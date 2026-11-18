import { resolveDomComponents } from "./resolveDomComponents";
import { createIdMappingState } from "./idMapper";
import type { SharedVNode } from "./bindings";

type V = SharedVNode & {
	children: Array<V | null>;
	instance?: object;
	dom?: HTMLElement;
};
const Fragment = () => null;
const bindings = {
	getActualChildren: (v: V) => v.children,
	getInstance: (v: V) => v.instance ?? v.dom,
	getComponent: (v: V) => v.instance ?? null,
	getDisplayName: (v: V) => v.props.name ?? "div",
	isComponent: (v: V) => typeof v.type === "function",
	getDom: (v: V) => v.dom ?? null,
};
const make = (
	type: unknown,
	name: string,
	children: Array<V | null> = [],
): V => ({
	type,
	props: { name },
	key: null,
	children,
	...(typeof type === "function"
		? { instance: {} }
		: { dom: document.createElement("div") }),
});
function fixture() {
	const host = make("div", "host");
	const app = make(() => null, "App", [host]);
	const root = make(Fragment, "root", [app]);
	const ids = createIdMappingState<V>(1, bindings.getInstance);
	ids.instToId.set(root.instance, 1);
	ids.idToVNode.set(1, root);
	const roots = new Map([[root, document.createElement("div")]]);
	return { host, app, root, ids, roots };
}

describe("prototype DOM to runtime-component resolution", () => {
	it("finds components without assigning IDs or relying on DOM parentage", () => {
		const f = fixture();
		const result = resolveDomComponents(
			f.roots,
			f.ids,
			bindings,
			{ Fragment },
			new Set([f.host.dom!]),
		);
		expect(result.matches.get(f.host.dom!)).toEqual({
			id: null,
			instance: f.app.instance,
			name: "App",
		});
		expect(f.ids.nextId).toBe(1);
		expect(f.host.dom!.parentNode).toBeNull();
	});

	it("resolves stale root wrappers to their current tree", () => {
		const f = fixture();
		const host = make("div", "new");
		const app = make(() => null, "Current", [host]);
		f.ids.idToVNode.set(1, { ...f.root, children: [app] });
		const result = resolveDomComponents(
			f.roots,
			f.ids,
			bindings,
			{ Fragment },
			new Set([host.dom!, f.host.dom!]),
		);
		expect(result.matches.has(f.host.dom!)).toBe(false);
		expect(result.matches.get(host.dom!)!.name).toBe("Current");
	});

	it("bounds visits through sparse trees and tolerates cycles", () => {
		const f = fixture();
		f.app.children = [f.app];
		expect(
			resolveDomComponents(
				f.roots,
				f.ids,
				bindings,
				{ Fragment },
				new Set([f.host.dom!]),
			).truncated,
		).toBe(false);
		f.app.children = new Array(10001).fill(null);
		expect(
			resolveDomComponents(
				f.roots,
				f.ids,
				bindings,
				{ Fragment },
				new Set([f.host.dom!]),
			).truncated,
		).toBe(true);
	});
});
