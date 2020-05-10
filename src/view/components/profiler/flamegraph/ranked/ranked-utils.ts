import { NodeTransform } from "../transform/focusNode";
import { ProfilerNode, CommitData } from "../../data/commits";
import { getGradient } from "../../data/gradient";
import { ID } from "../../../../store/types";
import { flattenNodeTree, EMPTY } from "../placeNodes";

const MIN_WIDTH = 4;

/**
 * Convert commit data into an array of position data to operate on.
 */
export function toTransform(commit: CommitData): NodeTransform[] {
	const nodes = flattenNodeTree(commit.nodes, commit.rootId);
	const root = commit.nodes.get(commit.commitRootId) || EMPTY;

	return nodes
		.filter(
			node => node.startTime >= root.startTime && node.endTime <= root.endTime,
		)
		.sort((a, b) => b.selfDuration - a.selfDuration)
		.map((node, i) => {
			return {
				id: node.id,
				width: node.selfDuration,
				x: 0,
				row: i,
				maximized: false,
				weight: getGradient(commit.maxSelfDuration, node.selfDuration),
				visible: true,
				commitParent: false,
			};
		});
}

/**
 * Place a pre-sorted array of nodes in a linear top to bottom list.
 * MUTATES position nodes to avoid many allocations for each node.
 */
export function placeRanked(
	tree: Map<ID, ProfilerNode>,
	sorted: NodeTransform[],
	selected: ProfilerNode,
	canvasWidth: number,
) {
	const scale = (canvasWidth || 1) / Math.max(selected.selfDuration, 0.01);
	let maximized = true;

	sorted.forEach(pos => {
		const node = tree.get(pos.id);
		if (!node) return;

		const selfDuration = node.selfDuration;

		// Ensure nodes are always visible
		pos.width = maximized
			? canvasWidth
			: Math.max(Math.max(selfDuration, 0.01) * scale, MIN_WIDTH);
		pos.maximized = maximized;

		if (pos.id === selected.id) {
			maximized = false;
		}
	});

	return sorted.slice();
}
