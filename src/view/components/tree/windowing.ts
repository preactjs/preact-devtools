import { ID } from "../../store";
import { valoo } from "../../valoo";

export function flattenChildren<T extends { id: ID; children: ID[] }>(
	tree: Map<ID, T>,
	id: ID,
): ID[] {
	const out: ID[] = [];
	const visited = new Set<ID>();
	let item: ID | undefined;
	let stack: ID[] = [id];
	while ((item = stack.pop())) {
		const node = tree.get(item);
		if (node) {
			if (!visited.has(node.id)) {
				if (node.id !== id) out.push(node.id);
				visited.add(node.id);
			}

			for (let i = node.children.length; i--; ) {
				stack.push(node.children[i]);
			}
		}
	}
	return out;
}

/**
 * Get the next id in the flattened node tree. Makes sure that we're
 * not out of bounds.
 */
export function getRelativeId(nodes: ID[], selected: ID, n: number): ID {
	let idx = nodes.findIndex(id => selected === id);
	idx = Math.max(0, Math.min(idx + n, nodes.length - 1));
	return nodes[idx]!;
}

/**
 * Filter out collapsed nodes from the flattened node tree.
 */
export function filterCollapsed<T extends { depth: number }>(
	nodes: Map<ID, T>,
	list: ID[],
	collapsed: Set<ID>,
) {
	let out: ID[] = [];

	let depth = Number.MAX_SAFE_INTEGER;
	for (let i = 0; i < list.length; i++) {
		let id = list[i];
		let node = nodes.get(id)!;
		if (collapsed.has(id)) {
			depth = node.depth;
			out.push(id);
		} else if (node.depth <= depth) {
			out.push(id);
		}
	}

	return out;
}

/**
 * The Collapser deals with hiding sections in a tree view
 */
export function createCollapser() {
	let collapsed = valoo(new Set<ID>());

	let collapse = (id: ID, shouldCollapse: boolean) => {
		collapsed.update(s => {
			shouldCollapse ? s.delete(id) : s.add(id);
		});
	};

	let toggle = (id: ID) => collapse(id, !collapsed.$.has(id));

	return {
		collapsed,
		collapse,
		toggle,
	};
}
