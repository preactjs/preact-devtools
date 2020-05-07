import { valoo } from "../../../valoo";
import { ProfilerState, ProfilerNode } from "../data/commits";
import { ID, Tree } from "../../../store/types";
import { placeNodes } from "./placeNodes";

export function createFlameGraphStore(profiler: ProfilerState) {
	const canvasWidth = valoo(600);

	const nodes = placeNodes(
		profiler.activeCommit,
		profiler.flamegraphType,
		profiler.selectedNodeId,
		canvasWidth,
	);

	return { nodes, canvasWidth };
}

export function getRoot(tree: Tree, id: ID) {
	let item = tree.get(id);
	let last = id;
	while (item !== undefined) {
		last = item.id;
		item = tree.get(item.parent);
	}

	return last;
}

export const normalize = (max: number, min: number, x: number) => {
	return (x - min) / (max - min);
};

export function sortTimeline(a: ProfilerNode, b: ProfilerNode) {
	const time = a.startTime - b.startTime;
	// Use depth as fallback if startTime is equal
	return time === 0 ? a.depth - b.depth : time;
}
