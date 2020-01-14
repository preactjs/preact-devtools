import { ID } from "../../store/types";

export function flattenChildren<
	K,
	T extends { id: K; children: K[]; depth: number }
>(tree: Map<K, T>, id: K, collapsed: Set<K>): { maxDepth: number; items: K[] } {
	const out: K[] = [];
	const visited = new Set<K>();
	let stack: K[] = [id];
	let maxDepth = 1;

	while (stack.length > 0) {
		const item = stack.pop();
		if (item == null) continue;

		const node = tree.get(item);
		if (!node) continue;

		if (!visited.has(node.id)) {
			out.push(node.id);
			visited.add(node.id);

			if (node.depth > maxDepth) {
				maxDepth = node.depth;
			}

			if (!collapsed.has(node.id)) {
				for (let i = node.children.length; i--; ) {
					stack.push(node.children[i]);
				}
			}
		}
	}

	return { maxDepth, items: out };
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
