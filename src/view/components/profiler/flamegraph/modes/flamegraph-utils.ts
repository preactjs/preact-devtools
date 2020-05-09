import { ProfilerNode, CommitData } from "../../data/commits";
import { NodeTransform } from "../transform/focusNode";
import { getGradient } from "../../data/gradient";
import { flattenNodeTree } from "../placeNodes";
import { ID } from "../../../../store/types";

/**
 * Convert tree to position nodes.
 */
export function toTransform(commit: CommitData): Map<ID, NodeTransform> {
	const root = commit.nodes.get(commit.commitRootId)!;

	const out = new Map<ID, NodeTransform>();
	flattenNodeTree(commit.nodes, commit.rootId).forEach(node => {
		out.set(node.id, {
			id: node.id,
			width: node.selfDuration,
			x: 0,
			row: node.depth,
			maximized: false,
			weight:
				node.startTime < root.startTime
					? -1
					: getGradient(commit.maxSelfDuration, node.selfDuration),
			visible: true,
			activeParent: false,
		});
	});

	return out;
}

/**
 * The default layout that's typical for a flamegraph chart.
 */
export function placeFlamegraph(
	tree: Map<ID, ProfilerNode>,
	transforms: Map<ID, NodeTransform>,
	rootId: ID,
	selected: ProfilerNode,
	canvasWidth: number,
): NodeTransform[] {
	// Collect parents upfront, so that we already know which
	// nodes should be maximized in the next traversal
	const parents = new Set<ID>([selected.id]);
	let item: ProfilerNode | undefined = selected;
	while ((item = tree.get(item.parent))) {
		parents.add(item.id);
	}

	const root = tree.get(rootId)!;
	const scale =
		(canvasWidth || 1) /
		(selected.treeEndTime - selected.treeStartTime || 0.01);
	const offset = selected.treeStartTime;

	// Use this value to keep track of when we enter the current
	// sub-tree that we're zoomed in into. Once we processed all
	// nodes of that we need to reset this value.
	let visitedSelectedRow = -1;

	const stack = [root];
	while ((item = stack.pop())) {
		// Track when we enter and leave the currently focused sub-tree
		if (item.id === selected.id) {
			visitedSelectedRow = item.depth;
		} else if (item.depth <= visitedSelectedRow) {
			visitedSelectedRow = -1;
		}

		const pos = transforms.get(item.id)!;
		// If we are a parent node of the selected node or the selected
		// node itself, we need to maximize it by stretching it over
		// the whole canvas.
		if (parents.has(item.id)) {
			pos.maximized = true;
			pos.width = canvasWidth;
			pos.x = 0;
			pos.visible = true;
			pos.activeParent = true;
		}
		// At this point the node isn't maximized. If we're not inside
		// the currently zoomed in sub-tree, we must be a node that
		// should be hidden.
		else if (visitedSelectedRow === -1) {
			pos.visible = false;
		}
		// Looks like the node is visible and we have to position it
		// inside the visible canvas.
		else {
			pos.maximized = false;
			pos.activeParent = false;
			pos.visible = true;
			pos.x = (item.treeStartTime - offset) * scale;
			pos.width = (item.treeEndTime - item.treeStartTime) * scale;
		}
		stack.push(...item.children.map(id => tree.get(id)!));
	}

	return Array.from(transforms.values());
}
