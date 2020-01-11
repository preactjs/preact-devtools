import { VNode } from "preact";
import { ID, Store } from "../../view/store/types";
import { getEndTime, getStartTime } from "./vnode";
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
	let isRecording = valoo(false);
	let timeStamp = valoo(-1);

	let session: ProfilerSession = {
		commits: [],
	};

	return {
		timeStamp,
		isRecording,
		get currentCommit() {
			const { commits } = session;
			return commits.length > 0 ? commits[commits.length - 1] : null;
		},
		addNewCommit(rootId: number) {
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
	const start = getStartTime(vnode);
	const end = getEndTime(vnode);
	if (commit) {
		// commit.durations.push(id, end - start);
	}
}
