import { Tree, ID, DevNodeType, DevNode } from "../../../../store/types";
import { deepClone, adjustNodesToRight } from "./util";

export function getStartPosition(tree: Tree, node: DevNode) {
	const parent = tree.get(node.parent)!;
	// Get START position (where to move the tree) by:
	//  - previous sibling treeEndTime (if previous siblings are present)
	//  - otherwise: parent treeStartTime
	const idx = parent.children.indexOf(node.children[0]);
	return idx > 0
		? tree.get(parent.children[idx - 1])!.treeEndTime
		: parent.treeStartTime;
}

export function getEndPosition(tree: Tree, node: DevNode) {
	const parent = tree.get(node.parent)!;
	// Get END position (where to move the tree) by:
	//  - next sibling treeStartTime (if next siblings are present)
	//  - otherwise: parent treeEndTime
	const idx = parent.children.indexOf(node.children[0]);
	return idx < parent.children.length - 1
		? tree.get(parent.children[idx + 1])!.treeStartTime
		: parent.treeEndTime;
}

export function getSubTreeDelta(tree: Tree, root: DevNode) {
	const parent = tree.get(root.parent)!;

	// Get start position (where to move the tree) by:
	//  - previous sibling treeEndTime (if previous siblings are present)
	//  - otherwise: parent treeStartTime
	const idx = parent.children.indexOf(root.children[0]);
	const start = getStartPosition(tree, root);

	// Get available end position
	//  - if
	const end =
		parent.children.length > idx + 1
			? tree.get(parent.children[idx + 1])!.treeStartTime
			: parent.treeEndTime;

	// A static tree has rendered before by definition. We can use the
	// tree-based timings here, because they're more likely to fit into
	// the available space.
	const actual = root.treeEndTime - root.treeStartTime;

	// Only shrink tree if it is wider than the available space
	const available = end - start;
	const scale = actual > available ? actual / available : 1;
	// offset = (start - root.startTime) * scale + start;
	const offset = start - root.startTime;

	console.log(
		"SUB TREE START ",
		root.children.map(id => tree.get(id)!.name).join(", "),
	);
	console.log("  available", available, start, end);
	console.log("  actual", actual);
	console.log("  scale", scale);
	console.log("  offset", offset);
	console.log();

	return { scale, offset };
}

export function patchTree(
	old: Tree,
	next: Tree,
	rootId: ID,
	mode: "expand" | "static",
	offset = 0,
) {
	if (next.size === 0) {
		return old;
	}

	const out: Tree = new Map(old);
	const oldRoot = old.get(rootId)!;
	let root = next.get(rootId)!;
	const parent = next.get(root.parent);

	// Nodes that represent roots of non-static sub-trees that
	// we inserted. We may need to resize parents and push siblings
	// to the right if the sub-tree node doesn't fit into the
	// available space.
	const maybeResize: DevNode[] = [];

	// 1. Mount new root and move tree to 0
	if (!oldRoot) {
		// Walk tree, because we may encounter re-queued sub-trees
		// that need a different offset value.
		const stack = [rootId];
		let item;
		const offsetStack = [root.startTime];
		const subtreeLevels = [-1];
		while ((item = stack.pop())) {
			const node = next.get(item);
			if (!node) continue;

			// Check if we've traversed out of the subtree and need
			// to go back to the previous offset value
			if (node.depth === subtreeLevels[subtreeLevels.length - 1]) {
				offsetStack.pop();
				subtreeLevels.pop();
			}

			let offset = offsetStack[offsetStack.length - 1];

			// Check if node is root of a re-queued sub-tree
			const parent = next.get(node.parent);
			if (parent && node.startTime >= parent.endTime) {
				const start = getStartPosition(next, node);
				offset = node.startTime - start;
				offsetStack.push(offset);
				maybeResize.push(node);
			}

			out.set(node.id, {
				...deepClone(node),
				treeStartTime: node.startTime - offset,
				treeEndTime: node.endTime - offset,
			});

			// Push children to stack in reverse to ensure that we
			// always traverse the tree in pre-order
			for (let i = node.children.length - 1; i >= 0; i--) {
				stack.push(node.children[i]);
			}
		}

		// Check if nodes that were flagged for potential resizing
		// actually need to be resized
		while ((item = maybeResize.pop())) {
			const end = getEndPosition(out, item);
			if (end < item.treeEndTime) {
				adjustNodesToRight(out, item.id, item.treeEndTime - end);
			}
		}

		return out;
	}

	const oldEnd = oldRoot.treeEndTime;
	const oldStart = oldRoot.treeStartTime;

	console.log();
	console.log("##", oldRoot.name, oldRoot.treeStartTime, oldRoot.treeEndTime);
	console.log(
		"   diff",
		oldRoot.endTime - oldRoot.startTime,
		root.endTime - root.startTime,
	);
	console.log();

	// Will always be 1 for non-static trees
	let scale = 1;

	// Amount by which we have to move the new tree along the x-axis
	offset = oldRoot.treeStartTime - root.startTime;

	if (mode === "static" && parent) {
		const delta = getSubTreeDelta(next, root);
		offset = delta.offset;
		scale = delta.scale;
	}

	// We need to process all "active" commit nodes before processing
	// static sub-trees to know how much space we have to place the
	// sub-tree into. These sub-trees are ususally the result of
	// memoization via `useMemo` or `memo()`.
	const staticTrees: ID[][] = [];

	// It's very important that we traverse the tree in pre-order to make sure
	// that previous siblings are positioned.
	const stack = [rootId];
	let item;
	while ((item = stack.pop())) {
		const node = next.get(item);
		if (!node) continue;

		const treeStartTime =
			(node.startTime - root.startTime) * scale + root.startTime + offset;
		const treeEndTime =
			(node.endTime - root.startTime) * scale + root.startTime + offset;

		console.log("-->", node.name);
		console.log("      time ", node.startTime, node.endTime);
		console.log("      root ", root.startTime, root.endTime);
		console.log("      tree ", treeStartTime, treeEndTime);
		console.log();

		const data: DevNode = {
			...deepClone(node),
			treeStartTime,
			treeEndTime,
		};
		out.set(node.id, data);

		if (node.id === root.id) {
			console.log(
				oldRoot.treeStartTime,
				oldRoot.treeEndTime,
				"vs",
				data.treeStartTime,
				data.treeEndTime,
			);
			root = data;
		}

		const staticChildren: ID[] = [];

		// Iterate backwards to ensure we process all nodes in pre-order
		for (let i = node.children.length - 1; i >= 0; i--) {
			const childId = node.children[i];
			const child = next.get(childId)!;

			if (child.startTime > root.endTime) {
				console.log(">> child", child.startTime, "vs", root.endTime);
			}

			// Check if we have a static sub-tree from a previous render.
			// We'll process those later.
			if (mode === "expand" && child && child.startTime < root.startTime) {
				staticChildren.push(childId);
			} else {
				stack.push(childId);
			}
		}

		if (staticChildren.length > 0) {
			staticTrees.push(staticChildren);
		}
	}

	// Expand / shrink parents and push nodes to the right to make space.
	if (mode === "expand") {
		const overflow = root.treeEndTime - oldRoot.treeEndTime;
		console.log(out.get(rootId));
		// const overflow = root.treeEndTime - oldRoot.treeEndTime;
		console.log("RESIZE", overflow, root.name);
		console.log("    ", oldStart, oldEnd);
		console.log("    ", root.treeStartTime, root.treeEndTime);

		adjustNodesToRight(out, rootId, -overflow);
	}

	staticTrees.forEach(children => {
		console.log("STATIC TREES");
		const first = next.get(children[0]!)!;
		const last = next.get(children[children.length - 1]!)!;

		// Insert a temporary wrapper around static children so that we can pretend
		// to always have a single root.
		const fakeId = -99;
		const fakeRoot: DevNode = {
			id: fakeId,
			name: "static-root-tmp",
			key: "",
			parent: first.parent,
			type: DevNodeType.ClassComponent,
			children,
			depth: -1,
			endTime: last.endTime,
			startTime: first.startTime,
			treeStartTime: first.treeStartTime,
			treeEndTime: last.treeEndTime,
		};
		out.set(fakeId, fakeRoot);
		old.set(fakeId, fakeRoot);

		const patched = patchTree(old, out, fakeId, "static");
		patched.forEach(node => {
			if (node.id !== fakeId) {
				out.set(node.id, node);
			}
		});

		out.delete(fakeId);
		old.delete(fakeId);
	});

	return out;
}
