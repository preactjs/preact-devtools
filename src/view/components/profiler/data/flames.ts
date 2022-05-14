import { ID } from "../../../store/types";
import { getRoot } from "../flamegraph/FlamegraphStore";
import { ProfilerCommit } from "./profiler2";

export interface Position {
	id: ID;
	start: number;
	width: number;
	row: number;
}

export function layoutRanked(commit: ProfilerCommit): Position[] {
	const arr: Position[] = [];
	Array.from(commit.rendered.values()).forEach((id, i) => {
		const selfDuration = commit.selfDurations.get(id)!;

		arr.push({
			id,
			start: 0,
			// FIXME: Is the floating point thing still relevant?
			width: selfDuration * 100, // Avoid floating point errors
			row: i,
		});
	});

	arr.sort((a, b) => b.width - a.width);

	return arr;
}

export function layoutFlameGraph(
	commit: ProfilerCommit,
): {
	pos: Position[];
	idToPos: Map<ID, Position>;
} {
	const rootId = getRoot(commit.nodes, commit.firstId);

	const pos: Position[] = [];
	const idToPos = new Map<ID, Position>();
	placeNode(commit, pos, idToPos, rootId, 0);

	return { pos, idToPos };
}

function placeNode(
	commit: ProfilerCommit,
	pos: Position[],
	idToPos: Map<ID, Position>,
	id: ID,
	depth: number,
) {
	const node = commit.nodes.get(id)!;
	let start = 0;
	if (node.parent !== -1) {
		const parentPos = idToPos.get(node.parent)!;
		start = parentPos.start + parentPos.width;
	}

	const nodePos: Position = {
		id,
		row: depth,
		start,
		width: commit.selfDurations.get(id)!,
	};
	pos.push(nodePos);
	idToPos.set(id, nodePos);

	for (let i = 0; i < node.children.length; i++) {
		const childId = node.children[i];
		const selfDuration = commit.selfDurations.get(childId)!;

		placeNode(commit, pos, idToPos, childId, depth + 1);

		// Expand parents upwards by self duration
		let parentId = id;
		while (parentId !== -1) {
			const parent = commit.nodes.get(parentId)!;
			idToPos.get(parentId)!.width += selfDuration;
			parentId = parent.parent;
		}
	}
}
