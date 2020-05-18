import { ID, DevNode, Tree } from "../../../../store/types";
import { FlameTree } from "./patchTree";

export function adjustNodesToRight(
	tree: Tree,
	flame: FlameTree,
	id: ID,
	delta: number,
	stopParent: ID,
	ignore: Set<ID>,
) {
	const children: ID[] = [];

	let item = tree.get(id);
	let prevParent = item;
	while (item && (item = tree.get(item.parent))) {
		if (ignore.has(item.id)) break;

		flame.get(item.id)!.end += delta;

		const idx = item.children.indexOf(prevParent!.id);
		if (idx < item.children.length - 1) {
			children.push(...item.children.slice(idx + 1));
		}

		// Stop traversing upwards if we reach the user defined limit
		if (item.id === stopParent) break;

		prevParent = item;
	}

	let childId;
	while ((childId = children.pop())) {
		if (ignore.has(childId)) continue;

		const pos = flame.get(childId)!;
		pos.start += delta;
		pos.end += delta;

		const node = tree.get(childId)!;
		children.push(...node.children);
	}
}

export function cloneTree(tree: Map<ID, DevNode>) {
	const clone = new Map<ID, DevNode>();
	tree.forEach((node, id) => clone.set(id, JSON.parse(JSON.stringify(node))));
	return clone;
}

export function deepClone<T extends object>(obj: T): T {
	return JSON.parse(JSON.stringify(obj));
}
