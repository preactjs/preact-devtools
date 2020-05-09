import { ID, Tree } from "../../../../store/types";
import { adjustNodesToRight, deepClone } from "./util";

/**
 * Merge a static (memoized) sub-tree into the current tree. We'll try
 * to fit it into the remaining space of the parent. It's not much,
 * but it's honest work!
 */
function placeStaticTree(tree: Tree, rootId: ID) {
	const root = tree.get(rootId)!;

	let offset = 0;
	let scale = 1;

	// Measure available space to fit the sub-tree into
	let spaceStart = 0;
	let spaceEnd = 0;

	const parent = tree.get(root.parent)!;
	const childIdx = parent.children.indexOf(root.id);

	if (childIdx + 1 < parent.children.length) {
		const nextChild = tree.get(parent.children[childIdx + 1])!;
		spaceEnd = nextChild.treeStartTime;
	} else {
		spaceEnd = parent.treeEndTime;
	}

	if (childIdx > 0) {
		// If the previous child is a static root, we'll continue to
		// traverse until we find the first sibling that is not static.
		// We do this to get the total free space and to distribute sibling
		// static trees accordingly.
		let staticWidth = root.treeEndTime - root.treeStartTime;
		let idx = childIdx;
		let prevChild;
		while ((prevChild = tree.get(parent.children[--idx])!)) {
			if (prevChild.startTime >= parent.startTime) {
				break;
			}
			staticWidth += prevChild.treeEndTime - prevChild.treeStartTime;
		}

		spaceStart = prevChild ? prevChild.treeEndTime : parent.treeStartTime;
		const available = spaceEnd - spaceStart;

		scale = staticWidth < available ? 1 : available / staticWidth;
		spaceStart =
			parent.treeStartTime +
			(staticWidth - (root.treeEndTime - root.treeStartTime));
		offset = spaceStart - root.treeStartTime * scale;
	} else {
		// If our node was the first child we can just take the
		// current tree start time of the parent
		spaceStart = parent.treeStartTime;

		if (spaceEnd - spaceStart < root.treeEndTime - root.treeStartTime) {
			scale =
				(spaceEnd - spaceStart) /
				// This can converge to 0, leading to wonky results
				(root.treeEndTime - root.treeStartTime || 0.01);
		}

		offset = spaceStart - root.treeStartTime * scale;
	}

	const stack = [rootId];
	let item;
	while ((item = stack.pop())) {
		const node = tree.get(item);
		if (!node) continue;

		tree.set(node.id, {
			...deepClone(node),
			// We need to scale down our tree first before moving it to
			// the new position
			treeStartTime: node.treeStartTime * scale + offset,
			treeEndTime: node.treeEndTime * scale + offset,
		});

		stack.push(...node.children);
	}
}

/**
 * Merge the newly rendered tree into the existing one. If the new
 * tree took longer to render than the previous version, we need to
 * expand all parents and push all right-hand nodes further to the
 * right to make room for our new tree.
 */
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
	const stack = [root.id];

	// We need to process all "active" commit nodes before processing
	// static sub-trees to know how much space we have to place the
	// sub-tree into. These sub-trees are ususally the result of
	// memoization via `useMemo` or `memo()`.
	const staticTrees: ID[] = [];

	let item;
	while ((item = stack.pop()) !== undefined) {
		const node = next.get(item);
		if (!node) continue;

		// Check if we have a static sub-tree from a previous render.
		// We'll process those later.
		if (node.startTime < root.startTime) {
			staticTrees.push(node.id);
			continue;
		}

		out.set(node.id, {
			...deepClone(node),
			treeStartTime: node.startTime + deltaStart,
			treeEndTime: node.endTime + deltaStart,
		});
		stack.push(...node.children);
	}

	// Enlarge parents and move children
	adjustNodesToRight(out, root.id, -deltaEnd);

	// Process any found static sub-trees
	staticTrees.forEach(rootId => placeStaticTree(out, rootId));

	return out;
}
