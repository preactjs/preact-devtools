import { ID, Tree } from "../../../../store/types";
import { mapChildren, adjustNodesToRight, cloneTree, deepClone } from "./util";

export function patchTree(old: Tree, next: Tree, rootId: ID): Tree {
	const out: Tree = new Map(old);
	const oldRoot = old.get(rootId);
	const root = next.get(rootId)!;

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

	let deltaStart = root.startTime - oldRoot.treeStartTime;
	let rootEnd = oldRoot.treeEndTime + deltaStart;
	let deltaEnd = oldRoot.treeEndTime - rootEnd;

	console.log(
		root.name,
		oldRoot.treeStartTime,
		root.treeStartTime,
		oldRoot.treeEndTime,
		rootEnd,
		"deltastart",
		deltaStart,
	);
	// Move new tree to old tree position.
	out.set(root.id, {
		...deepClone(root),
		treeStartTime: oldRoot.treeStartTime,
		treeEndTime: rootEnd,
	});

	// Move children of newly committed sub-tree
	mapChildren(next, root.id, child => {
		out.set(child.id, {
			...deepClone(child),
			// FIXME: This is completely wrong
			treeStartTime: child.treeStartTime + deltaStart,
			treeEndTime: child.treeEndTime + deltaStart,
		});
	});

	const adjustClone = cloneTree(out);

	// Enlarge parents and move children
	adjustNodesToRight(out, root.id, deltaEnd);

	// Validate
	out.forEach(node => {
		const parent = out.get(node.parent);
		if (parent && parent.id > -1) {
			if (node.treeEndTime > parent.treeEndTime) {
				console.error(
					`AFTER_ADJUST ${node.name} is larger than ${parent.name}: ${node.treeEndTime} vs ${parent.treeEndTime}`,
				);

				console.log(Array.from(adjustClone.values()));
				console.log(Array.from(out.values()));
			}
		}
	});

	return out;
}
