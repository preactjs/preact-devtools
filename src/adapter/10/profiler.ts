import { VNode } from "preact";
import { ID } from "../../view/store/types";
import { valoo } from "../../view/valoo";

export interface ProfilerCommit {
	/**
	 * Format:
	 * [id, duration, selfDuration, id, duration, selfDuration,...]
	 */
	timings: number[];
}

export interface ProfilerSession {
	commits: ProfilerCommit[];
}

export function createProfilerBackend() {
	const isRecording = valoo(false);
	const timeStamp = valoo(-1);

	const session: ProfilerSession = {
		commits: [],
	};

	return {
		timeStamp,
		isRecording,
		get currentCommit() {
			const { commits } = session;
			return commits.length > 0 ? commits[commits.length - 1] : null;
		},
		addNewCommit() {
			// session.commits.push({
			// 	rootId,
			// });
		},
		startProfiling() {
			// isRecording.$ = true;
			// session = {
			// 	commits: [],
			// 	names: [],
			// 	timestamp: Date.now(),
			// };
		},
		stopProfiling() {
			isRecording.$ = false;
			return session;
		},
	};
}

export type ProfilerBackend = ReturnType<typeof createProfilerBackend>;

export function recordProfilingData(
	id: ID,
	vnode: VNode,
	profiler: ProfilerBackend,
) {
	const commit = profiler.currentCommit;
	if (commit) {
		// commit.durations.push(id, end - start);
	}
}
