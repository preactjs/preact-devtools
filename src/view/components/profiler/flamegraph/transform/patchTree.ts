import { Tree, ID, DevNodeType, DevNode } from "../../../../store/types";
import { deepClone, adjustNodesToRight } from "./util";

export function patchTree(
	old: Tree,
	next: Tree,
	rootId: ID,
	mode: "expand" | "static",
) {
	if (next.size === 0) {
		return old;
	}

	const out: Tree = new Map(old);
	const oldRoot = old.get(rootId)!;
	const root = next.get(rootId)!;

	// If we are the very first tree, we can just mount all nodes immediately
	if (!oldRoot) {
		const offset = root.treeStartTime;

		next.forEach(node => {
			out.set(node.id, {
				...deepClone(node),
				treeStartTime: node.treeStartTime - offset,
				treeEndTime: node.treeEndTime - offset,
			});
		});
		return out;
	}

	let scale = 1;
	const available = oldRoot.treeEndTime - oldRoot.treeStartTime;
	let offset = oldRoot.treeStartTime - root.startTime;
	const overflow = -(
		oldRoot.treeEndTime -
		oldRoot.treeStartTime -
		(root.endTime - root.startTime)
	);
	if (mode === "static") {
		// Only resize static tree if necessary
		if (overflow > 0) {
			const parent = next.get(root.parent);
			if (parent) {
				// Fake root doesn't really exist in tree, get the first child instead
				const idx = parent.children.indexOf(root.children[0]);
				const start =
					idx > 0
						? next.get(parent.children[idx - 1])!.treeEndTime
						: parent.treeStartTime;

				scale = available / (root.endTime - root.startTime);
				offset = start - root.startTime * scale;
			}
		}
	}

	// We need to process all "active" commit nodes before processing
	// static sub-trees to know how much space we have to place the
	// sub-tree into. These sub-trees are ususally the result of
	// memoization via `useMemo` or `memo()`.
	const staticTrees: ID[][] = [];

	const stack = [root.id];
	let item;
	while ((item = stack.pop())) {
		const node = next.get(item);
		if (!node) continue;

		out.set(node.id, {
			...deepClone(node),
			treeStartTime: node.startTime * scale + offset,
			treeEndTime: node.endTime * scale + offset,
		});
		stack.push(...node.children);

		const staticChildren = [];

		for (let i = 0; i < node.children.length; i++) {
			const childId = node.children[i];
			const child = next.get(childId)!;

			// Check if we have a static sub-tree from a previous render.
			// We'll process those later.
			if (mode === "expand" && child.startTime < root.startTime) {
				staticChildren.push(childId);
			} else {
				stack.push(childId);
			}
		}

		if (staticChildren.length > 0) {
			staticTrees.push(staticChildren);
		}
	}

	if (mode === "expand") {
		adjustNodesToRight(out, rootId, overflow);
	}

	staticTrees.forEach(children => {
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
		next.set(fakeId, fakeRoot);
		old.set(fakeId, fakeRoot);

		const patched = patchTree(old, next, fakeId, "static");
		patched.forEach(node => {
			if (node.id !== fakeId) {
				out.set(node.id, node);
			}
		});

		next.delete(fakeId);
		old.delete(fakeId);
	});

	return out;
}
