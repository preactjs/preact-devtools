import { ID } from "../../store/types";

export function flattenChildren<K, T extends { id: K; children: K[] }>(
	tree: Map<K, T>,
	id: K,
	collapsed: Set<K>,
): K[] {
	const out: K[] = [];
	const visited = new Set<K>();
	let item: K | undefined;
	let stack: K[] = [id];

	while ((item = stack.pop())) {
		const node = tree.get(item);
		if (!node) continue;

		if (!visited.has(node.id)) {
			out.push(node.id);
			visited.add(node.id);

			if (!collapsed.has(node.id)) {
				for (let i = node.children.length; i--; ) {
					stack.push(node.children[i]);
				}
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
