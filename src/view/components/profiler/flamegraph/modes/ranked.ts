import { NodeTransform } from "../transform/focusNode";
import { ProfilerNode } from "../../data/commits";

/**
 * Layout nodes in a flat list from top to bottom
 * in descending order by the time it took a nod
 * to render.
 */
export function layoutRanked(nodes: ProfilerNode[]): NodeTransform[] {
	return nodes
		.sort((a, b) => b.selfDuration - a.selfDuration)
		.map((node, i) => {
			return {
				id: node.id,
				// Ensure nodes are always visible
				width: Math.max(node.selfDuration, 0.01),
				x: 0,
				row: i,
			};
		});
}
