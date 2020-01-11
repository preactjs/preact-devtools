import { ProfilerNode } from "../../data/commits";
import { NodeTransform } from "../transform/focusNode";

/**
 * The default layout that's typical for a flamegraph chart.
 */
export function layoutTimeline(nodes: ProfilerNode[]): NodeTransform[] {
	return nodes
		.sort((a, b) => a.treeStartTime - b.treeStartTime)
		.map(node => {
			return {
				id: node.id,
				x: node.treeStartTime,
				row: node.depth,
				width: node.treeEndTime - node.treeStartTime,
			};
		});
}
