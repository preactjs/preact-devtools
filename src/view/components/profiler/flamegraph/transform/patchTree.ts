import { DevNode, ID } from "../../../../store/types";
import { mapChildren, adjustNodesToRight, cloneTree } from "./util";

export function patchTree(
	tree: Map<ID, DevNode>,
	rootId: ID,
	oldRoot: DevNode,
) {
	const root = tree.get(rootId)!;

	// Bail out if timings didn't change
	if (
		oldRoot.startTime !== root.startTime ||
		oldRoot.endTime !== root.endTime
	) {
		return;
	}

	console.log(Array.from(cloneTree(tree).values()));

	let deltaStart = oldRoot.startTime - root.startTime;

	// Move new tree to old tree position.
	root.treeStartTime = oldRoot.treeStartTime;
	console.log("old tree ned", root.treeEndTime, oldRoot.treeEndTime);
	// FIXME: Somehow this leads to wrong numbers. Maybe due to minimum resizing?
	root.treeEndTime += deltaStart;
	let deltaEnd = oldRoot.treeEndTime - root.treeEndTime;
	console.log("new tree ned", root.treeEndTime, oldRoot.treeEndTime);

	console.log(
		deltaStart,
		deltaEnd,
		"duration",
		root.endTime - root.startTime,
		"old druation",
		oldRoot.endTime - oldRoot.startTime,
		"start",
		root.startTime,
		oldRoot.startTime,
		root.endTime,
		oldRoot.endTime,
		"tree start",
		oldRoot.treeStartTime,
		root.treeStartTime,
	);

	// Move children of newly committed sub-tree
	mapChildren(tree, root.id, child => {
		child.treeStartTime = child.treeStartTime + deltaStart;
		child.treeEndTime = child.treeEndTime + deltaStart;
	});

	const adjustClone = cloneTree(tree);

	// Enlarge parents and move children
	adjustNodesToRight(tree, root.id, deltaEnd);

	// Validate
	tree.forEach(node => {
		const parent = tree.get(node.parent);
		if (parent && parent !== node) {
			if (node.treeEndTime > parent.treeEndTime) {
				console.error(
					`AFTER_ADJUST ${node.name} is larger than ${parent.name}: ${node.treeEndTime} vs ${parent.treeEndTime}`,
				);

				console.log(Array.from(adjustClone.values()));
				console.log(Array.from(tree.values()));
			}
		}
	});

	return rootId;
}
