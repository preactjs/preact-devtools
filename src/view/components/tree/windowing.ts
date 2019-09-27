import { ID } from "../../store";

export function flattenChildren<T extends { id: ID; children: ID[] }>(
	tree: Map<ID, T>,
	id: ID,
	collapsed: Set<ID>,
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
