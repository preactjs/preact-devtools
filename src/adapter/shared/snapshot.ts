import type { PreactBindings, SharedVNode } from "./bindings";
import type { RendererConfig } from "./renderer";
import type { IdMappingState } from "./idMapper";
import type { TreeOptions, TreeSnapshot } from "../../api/types";
import { getVNodeId } from "./idMapper";
import { getSignalTextName } from "./utils";
import { byteLength, limit } from "../../api/serialize";

export function getTreeSnapshot<T extends SharedVNode>(
	roots: Map<T, Node>,
	ids: IdMappingState<T>,
	bindings: PreactBindings<T>,
	config: RendererConfig,
	options: TreeOptions = {},
	revision?: number,
): TreeSnapshot {
	const maxNodes = limit(options.maxNodes, 1000, 10000, "maxNodes");
	const maxDepth = limit(options.maxDepth, 20, 100, "maxDepth");
	const maxBytes = limit(options.maxBytes, 65536, 1048576, "maxBytes", 128);
	const result: TreeSnapshot = { nodes: [], truncated: false };
	if (revision !== undefined) result.revision = revision;
	const seen = new Set<T>();
	const stack: Array<{
		children: Iterator<T | null | undefined>;
		parent: number | null;
		depth: number;
	}> = [{ children: roots.keys(), parent: null, depth: 0 }];
	// Also bound visits through null child slots, not just emitted nodes.
	let visits = 0;
	while (stack.length > 0) {
		if (++visits > Math.max(100, maxNodes * 10)) {
			result.truncated = true;
			break;
		}
		const frame = stack[stack.length - 1];
		const next = frame.children.next();
		if (next.done) {
			stack.pop();
			continue;
		}
		let vnode = next.value;
		if (vnode == null) continue;
		if (frame.parent === null) {
			// Resolve replaced root wrappers to the current VNode. Visit each
			// map entry separately so even stale/duplicate roots obey the budget.
			vnode = ids.idToVNode.get(getVNodeId(ids, vnode));
			if (!vnode || seen.has(vnode)) continue;
		}
		if (result.nodes.length >= maxNodes) {
			result.truncated = true;
			break;
		}
		if (seen.has(vnode)) {
			result.truncated = true;
			continue;
		}
		seen.add(vnode);
		const id = getVNodeId(ids, vnode);
		const key = vnode.key;
		const name = getSignalTextName(bindings.getDisplayName(vnode, config));
		const keyText =
			key == null
				? null
				: typeof key === "object" || typeof key === "function"
					? "[Object]"
					: String(key);
		if (name.length > 256 || (keyText !== null && keyText.length > 256)) {
			result.truncated = true;
		}
		const index = result.nodes.length;
		result.nodes.push({
			parent: frame.parent,
			id: id === -1 ? null : id,
			name: name.slice(0, 256),
			key: keyText === null ? null : keyText.slice(0, 256),
			kind: bindings.isRoot(vnode, config)
				? "root"
				: bindings.isTextVNode(vnode)
					? "text"
					: bindings.isComponent(vnode)
						? "component"
						: "element",
		});
		const children = bindings.getActualChildren(vnode);
		if (frame.depth >= maxDepth) {
			if (children.length > 0) result.truncated = true;
		} else {
			stack.push({
				children: children[Symbol.iterator](),
				parent: index,
				depth: frame.depth + 1,
			});
		}
	}

	// A preorder prefix preserves parent references when trimming to a byte budget.
	if (byteLength(result) > maxBytes) {
		result.truncated = true;
		let low = 0;
		let high = result.nodes.length;
		while (low < high) {
			const mid = Math.ceil((low + high) / 2);
			if (
				byteLength({ ...result, nodes: result.nodes.slice(0, mid) }) <= maxBytes
			) {
				low = mid;
			} else {
				high = mid - 1;
			}
		}
		result.nodes.length = low;
	}
	return result;
}
