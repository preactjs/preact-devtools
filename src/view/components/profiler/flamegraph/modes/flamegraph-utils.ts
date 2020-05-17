import { NodeTransform } from "../transform/shared";
import { ID, DevNodeType, DevNode } from "../../../../store/types";
import { FlameTree } from "./patchTree";

export interface FlameNodeTransform extends NodeTransform {
	/** Relative start position to root node (without zoom) */
	start: number;
	/** Relative end position to root node (without zoom) */
	end: number;
}

/**
 * The default layout that's typical for a flamegraph chart.
 */
export function placeFlamegraph(
	tree: Map<ID, DevNode>,
	transforms: FlameTree,
	rootId: ID,
	selectedId: ID,
	canvasWidth: number,
): FlameNodeTransform[] {
	const selectedNode = tree.get(selectedId);
	// Collect parents upfront, so that we already know which
	// nodes should be maximized in the next traversal
	const parents = new Set<ID>([selectedId]);
	let item: DevNode | undefined = selectedNode;
	while (item && (item = tree.get(item.parent))) {
		parents.add(item.id);
	}

	const selectedPos = transforms.get(selectedId);
	if (!selectedPos) return [];

	const root = tree.get(rootId)!;
	const scale =
		(canvasWidth || 1) / (selectedPos.end - selectedPos.start || 0.01);
	const offset = selectedPos.start;

	// Use this value to keep track of when we enter the current
	// sub-tree that we're zoomed in into. Once we processed all
	// nodes of that we need to reset this value.
	let visitedSelectedRow = -1;

	const stack = [root];
	while ((item = stack.pop())) {
		// Track when we enter and leave the currently focused sub-tree
		if (item.id === selectedId) {
			visitedSelectedRow = item.depth;
		} else if (item.depth <= visitedSelectedRow) {
			visitedSelectedRow = -1;
		}

		if (item.type !== DevNodeType.Group) {
			const pos = transforms.get(item.id)!;
			// If we are a parent node of the selected node or the selected
			// node itself, we need to maximize it by stretching it over
			// the whole canvas.
			if (parents.has(item.id)) {
				pos.maximized = true;
				pos.width = canvasWidth;
				pos.x = 0;
				pos.visible = true;
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
				pos.visible = true;
				pos.x = (pos.start - offset) * scale;
				pos.width = (pos.end - pos.start) * scale;
			}
		}

		stack.push(...item.children.map(id => tree.get(id)!));
	}

	return Array.from(transforms.values());
}
