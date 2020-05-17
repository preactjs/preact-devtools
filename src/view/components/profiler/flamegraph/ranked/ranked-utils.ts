import { NodeTransform } from "../transform/shared";
import { CommitData } from "../../data/commits";
import { getGradient } from "../../data/gradient";
import { ID, DevNode } from "../../../../store/types";
import { flattenNodeTree, EMPTY } from "../placeNodes";

const MIN_WIDTH = 4;

/**
 * Convert commit data into an array of position data to operate on.
 */
export function toTransform(commit: CommitData): NodeTransform[] {
	const nodes = flattenNodeTree(commit.nodes, commit.rootId);
	const root = commit.nodes.get(commit.commitRootId) || EMPTY;
	const s = commit.selfDurations;

	return nodes
		.filter(
			node => node.startTime >= root.startTime && node.endTime <= root.endTime,
		)
		.sort((a, b) => {
			return (s.get(b.id) || 0) - (s.get(a.id) || 0);
		})
		.map((node, i) => {
			const selfDuration = s.get(node.id) || 0;
			return {
				id: node.id,
				width: selfDuration || 4,
				x: 0,
				row: i,
				maximized: false,
				weight: getGradient(commit.maxSelfDuration, selfDuration),
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
	tree: Map<ID, DevNode>,
	selfDurations: Map<ID, number>,
	sorted: NodeTransform[],
	selected: DevNode,
	canvasWidth: number,
) {
	const selectedDuration = selfDurations.get(selected.id) || 0;
	const scale = (canvasWidth || 1) / Math.max(selectedDuration, 0.01);
	let maximized = true;

	sorted.forEach(pos => {
		const node = tree.get(pos.id);
		if (!node) return;

		const selfDuration = selfDurations.get(node.id) || 0;

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
