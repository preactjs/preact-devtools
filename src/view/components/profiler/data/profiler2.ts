import { ID } from "../../../store/types";

export interface ProfilerNode {
	id: ID;
	name: string;
	hocs: string[] | null;
}

/**
 * [ID, startTimeStamp, duration]
 */
export type ProfilerNodeTiming = [ID, number, number];

export interface ProfilerCommit {
	start: number;
	nodes: ProfilerNodeTiming[];
}

export interface ProfilerSession {
	nodes: Map<ID, ProfilerNode>;
	commits: ProfilerNodeTiming[];
}

export function foo(session: ProfilerSession) {
	// Prepare initial tree
	const a;

	// Loop over recorded commits and patch in changed nodes.
	// Each commit will be based on the previous one.
}
