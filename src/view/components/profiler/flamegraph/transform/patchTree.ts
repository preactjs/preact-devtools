import { ID, Tree } from "../../../../store/types";
import { mapChildren, adjustNodesToRight, deepClone } from "./util";

export function patchTree(old: Tree, next: Tree, rootId: ID): Tree {
	const out: Tree = new Map(old);
	const oldRoot = old.get(rootId);
	const root = next.get(rootId)!;

	if (next.size === 0) {
		return old;
	}

	// Fast path if tree is new
	if (!oldRoot) {
		const offset = root.startTime;

		next.forEach(node => {
			out.set(node.id, {
				...deepClone(node),
				treeStartTime: node.startTime - offset,
				treeEndTime: node.endTime - offset,
			});
		});
		return out;
	}

	const deltaStart = oldRoot.treeStartTime - root.startTime;
	const deltaEnd =
		oldRoot.treeEndTime -
		oldRoot.treeStartTime -
		(root.endTime - root.startTime);

	// Move new tree to old tree position.
	out.set(root.id, {
		...deepClone(root),
		treeStartTime: oldRoot.treeStartTime,
		treeEndTime: oldRoot.treeStartTime + (root.endTime - root.startTime),
	});

	// Move children of newly committed sub-tree
	mapChildren(next, root.id, child => {
		out.set(child.id, {
			...deepClone(child),
			// TODO: Check for stale children
			treeStartTime: child.startTime + deltaStart,
			treeEndTime: child.endTime + deltaStart,
		});
	});

	// Enlarge parents and move children
	adjustNodesToRight(out, root.id, -deltaEnd);

	return out;
}
