import { Tree, ID, DevNode, DevNodeType } from "../../../../store/types";
import { adjustNodesToRight } from "./adjustNodesToRight";
import { FlameNodeTransform } from "./flamegraph-utils";
import { getGradient } from "../../data/gradient";
import { CommitData } from "../../data/commits";

export type FlameTree = Map<ID, FlameNodeTransform>;

function createTransform(): FlameNodeTransform {
	return {
		id: -1,
		weight: -1,
		commitParent: false,
		row: -1,
		start: -1,
		end: -1,

		// Only used for local transforms (zooming, canvas resizing)
		visible: true,
		maximized: false,
		width: 0,
		x: 0,
	};
}

function createGroup(): DevNode {
	return {
		id: -1,
		type: DevNodeType.Group,
		children: [],
		depth: -1,
		hocs: null,
		endTime: -1,
		startTime: -1,
		name: "__PREACT_GROUP__",
		key: "",
		parent: -1,
	};
}

export function getStartPosition(tree: Tree, flame: FlameTree, node: DevNode) {
	const parent = tree.get(node.parent)!;

	// Get START position (where to move the tree) by:
	//  - previous sibling end (if previous siblings are present)
	//  - otherwise: parent start
	const idx = parent.children.indexOf(node.id);
	return idx > 0
		? flame.get(parent.children[idx - 1])!.end
		: flame.get(parent.id)!.start;
}

export function getEndPosition(tree: Tree, flame: FlameTree, id: ID) {
	const node = tree.get(id)!;
	const parent = tree.get(node.parent)!;
	// Get END position (where to move the tree) by:
	//  - next sibling start (if next siblings are present)
	//  - otherwise: parent end
	const idx = parent.children.indexOf(id);
	return idx + 1 < parent.children.length
		? flame.get(parent.children[idx + 1])!.start
		: flame.get(parent.id)!.end;
}

/**
 * Move node as far to the end as possible, where they are usually
 * found. This prevents sub-trees from moving left to right between
 * each commit.
 */
export function moveToEnd(tree: Tree, flame: FlameTree, item: DevNode) {
	const end = getEndPosition(tree, flame, item.id);
	const pos = flame.get(item.id)!;
	if (end > pos.end) {
		const offset = end - pos.end;

		const stack = [item.id];
		let id;
		while ((id = stack.pop())) {
			const pos = flame.get(id);
			const node = tree.get(id);
			if (!pos || !node) continue;

			pos.start += offset;
			pos.end += offset;

			stack.push(...node.children);
		}
	}
}

/**
 * Place static (memoized) trees. Contrary to non-static ones these
 * should not expand parent nodes, but scale down to fit into the
 * remaining space.
 */
export function placeStaticTrees(
	tree: Tree,
	flame: FlameTree,
	staticRoots: DevNode[],
) {
	for (let i = staticRoots.length - 1; i >= 0; i--) {
		const root = staticRoots[i];
		const needsResize: DevNode[] = [];

		const offsetStack = [-root.startTime];
		const subtreeLevels = [-1];

		const stack = [root.id];
		let id;
		while ((id = stack.pop())) {
			const node = tree.get(id);
			if (!node) continue;

			const parent = tree.get(node.parent);
			// Check if node is root of a re-queued sub-tree
			if (
				parent &&
				(node.startTime >= parent.endTime || node.endTime >= parent.endTime)
			) {
				const start = getStartPosition(tree, flame, node);
				offsetStack.push(-(node.startTime - start));
				subtreeLevels.push(node.depth);
				needsResize.push(node);
			}

			const offset = offsetStack[offsetStack.length - 1];
			const start = node.startTime + offset;
			const end = node.endTime + offset;

			const flameParent = flame.get(node.parent);
			if (flameParent && flameParent.end < end) {
				needsResize.push(node);
			}

			const pos = createTransform();
			pos.id = node.id;
			pos.row = node.depth;
			pos.start = start;
			pos.end = end;
			pos.weight = -1;
			flame.set(node.id, pos);

			// Push children to stack in reverse to ensure that we
			// always traverse the tree in pre-order
			for (let j = node.children.length - 1; j >= 0; j--) {
				stack.push(node.children[j]);
			}
		}

		needsResize.forEach(node => {
			const delta =
				flame.get(node.id)!.end - getEndPosition(tree, flame, node.id);
			adjustNodesToRight(tree, flame, node.id, delta, root.id, new Set());

			// Move nodes to end for a less jarring visual experience
			if (delta < 0) {
				moveToEnd(tree, flame, node);
			}
		});
	}

	// At this point each static tree is consistent in itself, but we
	// need to move them the correct position in commit tree and scale
	// the static one to fit the available space.

	// 1. Group static siblings
	// 2. Move static siblings next to each other
	// 3. Move Group to final start position
	// 4. Scale down group to available width if necessary

	// Build groups
	let groupId = -1;
	const groups: DevNode[] = [];
	for (let i = 0; i < staticRoots.length; i++) {
		const root = staticRoots[i];

		const group = createGroup();
		group.id = groupId--;
		group.children.push(root.id);
		group.parent = root.parent;

		const parent = tree.get(root.parent);
		if (parent) {
			const idx = parent.children.indexOf(root.id);
			let j = 1;
			const i2 = i;
			while (idx + j < parent.children.length) {
				if (i2 + j > staticRoots.length - 1) {
					break;
				}

				if (staticRoots[i2 + j].parent === parent.id) {
					group.children.push(staticRoots[i2 + j].id);
					i++;
				}
				j++;
			}
		}

		groups.push(group);
	}

	// Move siblings next to each other
	groups.forEach(group => {
		const root = tree.get(group.children[0])!;
		const rootPos = flame.get(root.id)!;
		let offset = rootPos.end;

		for (let i = 1; i < group.children.length; i++) {
			const child = group.children[i];
			const pos = flame.get(child)!;

			const stack = [child];
			let item;
			while ((item = stack.pop())) {
				const childPos = flame.get(item)!;
				const oldStart = childPos.start;
				childPos.start = offset;
				childPos.end = offset + (childPos.end - oldStart);

				const node = tree.get(item)!;
				stack.push(...node.children);
			}

			offset = pos.end;
		}

		// Move group to final position
		const parent = tree.get(root.parent);
		if (parent) {
			const firstId = group.children[0];
			const lastId = group.children[group.children.length - 1];

			const firstIdx = parent.children.indexOf(firstId);
			const lastIdx = parent.children.indexOf(lastId);

			const start =
				firstIdx > 0
					? flame.get(parent.children[firstIdx - 1])!.end
					: flame.get(parent.id)!.start;
			const end =
				lastIdx + 1 < parent.children.length
					? flame.get(parent.children[lastIdx + 1])!.end
					: flame.get(parent.id)!.end;

			const firstPos = flame.get(firstId)!;
			const lastPos = flame.get(lastId)!;
			offset = start - firstPos.start;

			const available = end - start;
			const actual = flame.get(lastId)!.end - flame.get(firstId)!.start;
			const scale = available < actual ? available / actual : 1;

			const stack = [...group.children];
			let item;
			while ((item = stack.pop())) {
				const childPos = flame.get(item)!;
				childPos.start = childPos.start * scale + offset;
				childPos.end = childPos.end * scale + offset;

				const node = tree.get(item)!;
				stack.push(...node.children);
			}

			offset = lastPos.end;
		}
	});
}

export function getCommitRootOrVirtual(commit: CommitData): DevNode | null {
	if (commit.rendered.length > 1) {
		const first = commit.nodes.get(commit.rendered[0]);
		const second = commit.nodes.get(commit.rendered[1]);
		if (first && second && first.parent === second.parent) {
			const virtual: DevNode = {
				id: -9,
			};
		}
	}

	return null;
}

/**
 * Place commit tree. When a node's children are bigger than it's parent,
 * the parent and all next siblings will be expanded (pushed) to the right.
 */
export function patchTree(
	prevCommit: CommitData | null,
	commit: CommitData,
): FlameTree {
	const { nodes: tree, rootId, maxSelfDuration } = commit;

	const flame: FlameTree = new Map();

	if (tree.size === 0) {
		return flame;
	}

	const commitRoot = getCommitRootOrVirtual(commit)!;

	const commitParents = new Set<ID>();
	let direct: DevNode | undefined = commitRoot;
	while ((direct = tree.get(direct.parent))) {
		commitParents.add(direct.id);
	}

	const renderedNodes = new Set<ID>();

	const root = tree.get(rootId)!;

	// Nodes that represent roots of non-static sub-trees that
	// we inserted. We may need to resize parents and push siblings
	// to the right if the sub-tree node doesn't fit into the
	// available space.
	const maybeGrow: DevNode[] = [];

	const staticRoots: DevNode[] = [];

	// Check if we are in mount mode
	// Walk tree, because we may encounter re-queued sub-trees
	// that need a different offset value.
	const offsetStack = [-root.startTime];
	const subtreeLevels = [-1];

	const stack = [rootId];
	let item;
	while ((item = stack.pop())) {
		const node = tree.get(item);
		if (!node) continue;

		// Add to rendered nodes if we're traversing into the actively
		// committed tree
		if (node.id === commitRootId || renderedNodes.has(node.parent)) {
			renderedNodes.add(node.id);
		}

		// Check if we've traversed out of the subtree and need
		// to go back to the previous offset value
		if (node.depth === subtreeLevels[subtreeLevels.length - 1]) {
			offsetStack.pop();
			subtreeLevels.pop();
		}

		if (node.id === commitRootId && rootId !== commitRootId) {
			const parent = tree.get(commitRoot.parent)!;
			const idx = parent.children.indexOf(commitRootId);
			const start =
				idx > 0
					? flame.get(parent.children[idx - 1])!.end
					: flame.get(parent.id)!.start;

			const commitOffset = start - commitRoot.startTime;

			offsetStack.push(commitOffset);
			subtreeLevels.push(node.depth);
		}

		// Check if we're dealing with a memoized tree
		if (renderedNodes.has(node.id) && node.startTime < commitRoot.startTime) {
			staticRoots.push(node);
			continue;
		}

		const parent = tree.get(node.parent);
		// Check if node is root of a re-queued sub-tree
		if (node.id !== commitRootId && parent) {
			const start = getStartPosition(tree, flame, node);

			const offset = offsetStack[offsetStack.length - 1];
			if (node.startTime + offset < start) {
				offsetStack.push(start - node.startTime);
				subtreeLevels.push(node.depth);
			} else if (
				node.startTime >= parent.endTime ||
				node.endTime >= parent.endTime
			) {
				offsetStack.push(start - node.startTime);
				subtreeLevels.push(node.depth);

				const nextOffset = offsetStack[offsetStack.length - 1];
				if (
					node.startTime + nextOffset >= parent.endTime ||
					node.endTime + nextOffset >= parent.endTime
				) {
					maybeGrow.push(node);
				}
			}
		}

		const offset = offsetStack[offsetStack.length - 1];
		const start = node.startTime + offset;
		const end = node.endTime + offset;

		const flameParent = flame.get(node.parent);
		if (flameParent) {
			if (flameParent.end < end) {
				maybeGrow.push(node);
			}
		}

		const pos = createTransform();
		pos.id = node.id;
		pos.weight = !renderedNodes.has(node.id)
			? -1
			: getGradient(maxSelfDuration, commit.selfDurations.get(node.id) || 0);
		pos.commitParent = commitParents.has(node.id);
		pos.row = node.depth;
		pos.start = start;
		pos.end = end;
		flame.set(node.id, pos);

		if (start < 0) {
			// eslint-disable-next-line no-console
			console.warn(
				`< 0 ${node.name} #${node.id} ${end} ${offset} ${node.startTime}`,
			);

			pos.start += -start;
			pos.end += -start;
		}

		// Push children to stack in reverse to ensure that we
		// always traverse the tree in pre-order
		for (let i = node.children.length - 1; i >= 0; i--) {
			stack.push(node.children[i]);
		}
	}

	// Check if nodes that were flagged for potential enlargement
	// actually need to be resized
	while ((item = maybeGrow.pop())) {
		let delta = flame.get(item.id)!.end - getEndPosition(tree, flame, item.id);

		if (delta < 0 && item.id === commitRootId && prevCommit !== null) {
			const prev = prevCommit.nodes.get(commitRootId);
			if (prev) {
				delta = item.endTime - item.startTime - (prev.endTime - prev.startTime);
			}
		}
		adjustNodesToRight(
			tree,
			flame,
			item.id,
			delta,
			rootId,
			new Set(staticRoots.map(node => node.id)),
		);

		// Move nodes to end for a less jarring visual experience
		if (delta < 0) {
			moveToEnd(tree, flame, item);
		}
	}

	placeStaticTrees(tree, flame, staticRoots);

	// Prettify: We'll expand the commitRoot tree to fit available space
	if (commitRoot.parent > -1) {
		const end = getEndPosition(tree, flame, commitRootId);
		const pos = flame.get(commitRootId)!;
		if (end > pos.end) {
			adjustNodesToRight(
				tree,
				flame,
				commitRootId,
				pos.end - end,
				-1,
				new Set(),
			);
		}
	}

	return flame;
}
