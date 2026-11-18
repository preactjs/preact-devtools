import type { PreactBindings, SharedVNode } from "./bindings";
import type { IdMappingState } from "./idMapper";
import type { RendererConfig } from "./renderer";
import { getVNodeId } from "./idMapper";

export interface DomComponent {
	id: number | null;
	instance: object;
	name: string;
}

/** Prototype: one bounded runtime walk for all requested targets, not DOM ancestry. */
export function resolveDomComponents<T extends SharedVNode>(
	roots: Map<T, Node>,
	ids: IdMappingState<T>,
	bindings: Pick<
		PreactBindings<T>,
		| "isComponent"
		| "getComponent"
		| "getDisplayName"
		| "getDom"
		| "getActualChildren"
	>,
	config: RendererConfig,
	targets: ReadonlySet<Node>,
) {
	const matches = new Map<Node, DomComponent>();
	const seen = new Set<T>();
	const stack: Array<{
		children: Iterator<T | null | undefined>;
		component: DomComponent | null;
	}> = [{ children: roots.keys(), component: null }];
	let visits = 0;
	while (stack.length && matches.size < targets.size) {
		if (++visits > 10000) return { matches, truncated: true };
		const frame = stack[stack.length - 1];
		const next = frame.children.next();
		if (next.done) {
			stack.pop();
			continue;
		}
		let vnode = next.value;
		if (!vnode) continue;
		if (stack.length === 1) vnode = ids.idToVNode.get(getVNodeId(ids, vnode));
		if (!vnode || seen.has(vnode)) continue;
		seen.add(vnode);
		let component = frame.component;
		if (bindings.isComponent(vnode)) {
			if (vnode.type !== config.Fragment && bindings.getComponent(vnode)) {
				const id = getVNodeId(ids, vnode);
				component = {
					id: id === -1 ? null : id,
					instance: bindings.getComponent(vnode)!,
					name: bindings.getDisplayName(vnode, config).slice(0, 256),
				};
			}
		} else {
			const dom = bindings.getDom(vnode);
			if (dom && targets.has(dom) && component) matches.set(dom, component);
		}
		stack.push({
			children: bindings.getActualChildren(vnode)[Symbol.iterator](),
			component,
		});
	}
	return { matches, truncated: false };
}
