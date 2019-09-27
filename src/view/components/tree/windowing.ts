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
		if (!node) continue;

		if (!visited.has(node.id)) {
			out.push(node.id);
			visited.add(node.id);

			for (let i = node.children.length; i--; ) {
				stack.push(node.children[i]);
			}
		}
	}

	return out;
}

export function clamp(n: number, max: number) {
	return Math.max(0, Math.min(n, max));
}

export interface Traversable {
	id: ID;
	parent: ID;
	children: ID[];
}

export function getLastChild(nodes: Map<ID, Traversable>, id: ID): ID {
	let stack = [id];
	let item;
	let last = id;
	while ((item = stack.pop()) != null) {
		last = item;
		const node = nodes.get(item);
		if (node && node.children.length > 0) {
			stack.push(node.children[node.children.length - 1]);
		}
	}

	return last;
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

	let max = Number.MAX_SAFE_INTEGER;
	let depth = max;
	for (let i = 0; i < list.length; i++) {
		let id = list[i];
		let node = nodes.get(id);
		if (node) {
			if (collapsed.has(id)) {
				depth = node.depth;
				out.push(id);
			} else if (node.depth <= depth) {
				if (node.depth === depth) {
					depth = max;
				}
				out.push(id);
			}
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
