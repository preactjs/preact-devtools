import { ID } from "../../../store/types";
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
		if (!commit.selfDurations.has(id)) {
			console.log("NOOOOO", id);
		}
		const selfDuration = commit.selfDurations.get(id) || 0;

		arr.push({
			id,
			start: 0,
			width: selfDuration * 100, // Avoid floating point errors
			row: i,
		});
	});

	arr.sort((a, b) => b.width - a.width);

	return arr;
}
