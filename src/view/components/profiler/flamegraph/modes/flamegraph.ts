import { ProfilerNode } from "../../data/commits";
import { NodeTransform } from "../transform/focusNode";
import { getGradient } from "../../data/gradient";

/**
 * The default layout that's typical for a flamegraph chart.
 */
export function layoutTimeline(
	nodes: ProfilerNode[],
	root: ProfilerNode,
	selected: ProfilerNode,
	maxSelfDuration: number,
): NodeTransform[] {
	const offset = selected.treeStartTime;

	return nodes
		.sort((a, b) => a.treeStartTime - b.treeStartTime)
		.map(node => {
			let weight = -1;
			if (
				node.treeEndTime <= root.treeStartTime ||
				node.treeStartTime > root.treeEndTime
			) {
				weight = -2;
			} else if (root.depth > node.depth) {
				weight = -5;
			} else {
				weight = getGradient(maxSelfDuration, node.selfDuration);
			}

			return {
				id: node.id,
				// Normalize x coordinate
				x: node.treeStartTime - offset,
				row: node.depth,
				width: node.treeEndTime - node.treeStartTime,
				weight,
				maximized: false,
				visible: true,
			};
		});
}
