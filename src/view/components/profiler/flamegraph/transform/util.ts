import { ID, DevNode } from "../../../../store/types";

export function mapParents(
	tree: Map<ID, DevNode>,
	id: ID,
	fn: (parent: DevNode, prevParent: DevNode) => void | boolean,
) {
	const prevParent = tree.get(id)!;
	if (!prevParent) return;

	let item = tree.get(prevParent.parent);
	while (item !== undefined) {
		if (fn(item, prevParent) === true) {
			break;
		}

		// FIXME: Fragments have their own id as parent id
		if (item.id === item.parent) {
			break;
		}

		item = tree.get(item.parent);
	}
}

export function mapChildren(
	tree: Map<ID, DevNode>,
	id: ID,
	fn: (node: DevNode) => void,
) {
	const stack = [id];
	let item;
	while ((item = stack.pop()) !== undefined) {
		const node = tree.get(item);
		if (node) {
			fn(node);
			stack.push(...node.children);
		}
	}
}

export function adjustNodesToRight(
	tree: Map<ID, DevNode>,
	id: ID,
	delta: number,
) {
	mapParents(tree, id, (parent, prevParent) => {
		parent.treeEndTime += delta;

		const idx = parent.children.indexOf(prevParent.id);
		if (idx > -1) {
			const tasks = parent.children.slice(idx + 1);

			tasks.forEach(childId => {
				mapChildren(tree, childId, child => {
					child.treeEndTime += delta;
					child.treeStartTime += delta;
				});
			});
		}
	});
}

export function cloneTree(tree: Map<ID, DevNode>) {
	const clone = new Map<ID, DevNode>();
	tree.forEach((node, id) => clone.set(id, JSON.parse(JSON.stringify(node))));
	return clone;
}

export function deepClone<T extends object>(obj: T): T {
	return JSON.parse(JSON.stringify(obj));
}
