import { ID, DevNode, Tree } from "../../../../store/types";
import { FlameTree } from "../modes/patchTree";

export function mapParents<T extends DevNode>(
	tree: Map<ID, T>,
	id: ID,
	fn: (parent: T, prevParent: T) => void | boolean,
) {
	let prevParent = tree.get(id)!;
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

		prevParent = item!;
		item = tree.get(item.parent);
	}
}

export function mapChildren<T extends DevNode>(
	tree: Map<ID, T>,
	id: ID,
	fn: (node: T) => void,
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
	tree: Tree,
	flame: FlameTree,
	id: ID,
	delta: number,
	stopParent: ID,
) {
	const children: ID[] = [];

	let item = tree.get(id);
	let prevParent = item;
	while (item && (item = tree.get(item.parent))) {
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
	while (childId && (childId = children.pop())) {
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
