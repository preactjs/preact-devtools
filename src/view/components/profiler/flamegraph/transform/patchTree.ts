import { ID, Tree } from "../../../../store/types";
import { adjustNodesToRight, deepClone } from "./util";

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
	// Track root depth of memoized sub-trees. Those need to be resized
	// instead of just moved.
	let staticRootDepth = -1;
	let staticScale = 1;
	let staticOffset = 0;

	let item;
	while ((item = stack.pop()) !== undefined) {
		const node = next.get(item);
		if (node) {
			let start = 0;
			let end = 0;

			// Check if we have a static sub-tree from a previous render
			if (node.startTime < root.startTime) {
				// If we are the topmost node of a static sub-tree we need
				// to calculate the scaling factor and offset for this tree.
				if (staticRootDepth === -1) {
					staticRootDepth = node.depth;

					// Measure available space to fit the sub-tree into
					let spaceStart = 0;
					let spaceEnd = 0;

					const parent = out.get(node.parent)!;
					const childIdx = parent.children.indexOf(node.id);

					if (childIdx > 0) {
						// Move our sub-tree right next to the previous child
						const prevChild = out.get(parent.children[childIdx - 1])!;
						spaceStart = prevChild.treeEndTime;
					} else {
						// If our node was the first child we can just take the
						// current tree start time of the parent
						spaceStart = parent.treeStartTime;
					}

					if (childIdx + 1 < parent.children.length) {
						const nextChild = out.get(parent.children[childIdx + 1])!;
						spaceEnd = nextChild.treeStartTime + deltaStart;
					} else {
						spaceEnd = parent.treeEndTime;
					}

					staticScale =
						(spaceEnd - spaceStart) / (node.treeEndTime - node.treeStartTime);
					staticOffset = spaceStart - node.treeStartTime * staticScale;
				}

				// We need to scale down our tree first before moving it to
				// the new position
				start = node.treeStartTime * staticScale + staticOffset;
				end = node.treeEndTime * staticScale + staticOffset;
			}
			// Not a static sub-tree, proceed as usual
			else {
				// Reset stale subtree tracking
				if (staticRootDepth > -1) {
					staticRootDepth = -1;
					staticScale = 1;
					staticOffset = 0;
				}

				start = node.startTime + deltaStart;
				end = node.endTime + deltaStart;
			}
			out.set(node.id, {
				...deepClone(node),
				treeStartTime: start,
				treeEndTime: end,
			});
			stack.push(...node.children);
		}
	}

	// Enlarge parents and move children
	adjustNodesToRight(out, root.id, -deltaEnd);

	return out;
}
