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
	placeNode(commit, pos, idToPos, rootId, 0, 0);

	return { pos, idToPos };
}

function placeNode(
	commit: ProfilerCommit,
	pos: Position[],
	idToPos: Map<ID, Position>,
	id: ID,
	depth: number,
	offset: number,
) {
	const nodeSelfDuration = commit.selfDurations.get(id)!;
	let duration = nodeSelfDuration;
	const nodePos: Position = {
		id,
		row: depth,
		start: offset,
		width: -1,
	};
	pos.push(nodePos);
	idToPos.set(id, nodePos);

	const node = commit.nodes.get(id)!;
	for (let i = 0; i < node.children.length; i++) {
		const childId = node.children[i];
		const selfDuration = commit.selfDurations.get(childId)!;
		duration += selfDuration;
		placeNode(
			commit,
			pos,
			idToPos,
			childId,
			depth + 1,
			offset + nodeSelfDuration,
		);
	}

	nodePos.width = duration;
}
