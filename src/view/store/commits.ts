import { ID, DevNode } from "./types";
import { Observable, valoo, watch } from "../valoo";

export interface ProfilerNode extends DevNode {
	duration: number;
	selfDuration: number;
}

export interface CommitData {
	/** Id of the tree's root node */
	rootId: ID;
	/** Id of the node the commit was triggered on */
	commitRootId: ID;
	maxDepth: number;
	maxSelfDuration: number;
	duration: number;
	nodes: Map<ID, ProfilerNode>;
}

export enum FlamegraphType {
	TIMELINE = "TIMELINE",
	RANKED = "RANKED",
}

export interface ProfilerState {
	isRecording: Observable<boolean>;
	recStartTime: Observable<number>;
	commits: Observable<CommitData[]>;
	activeCommitIdx: Observable<number>;
	activeCommit: Observable<CommitData | null>;
	selectedNodeId: Observable<ID>;
	selectedNode: Observable<ProfilerNode | null>;
	flamegraphType: Observable<FlamegraphType>;
}

export function createProfiler2(): ProfilerState {
	const activeCommitIdx = valoo(0);
	const selectedNodeId = valoo(0);
	const commits = valoo<CommitData[]>([]);

	commits.on(v => console.log("cmmits", v));

	const activeCommit = watch(() => {
		return (commits.$.length > 0 && commits.$[activeCommitIdx.$]) || null;
	});

	const selectedNode = watch(() => {
		return activeCommit.$ != null
			? activeCommit.$.nodes.get(selectedNodeId.$) || null
			: null;
	});

	const recStartTime = valoo(0);
	const isRecording = valoo(false);
	isRecording.on(v => {
		if (v) {
			commits.$ = [];
			activeCommitIdx.$ = 0;
			selectedNodeId.$ = 0;
			recStartTime.$ = performance.now();
		} else {
			if (commits.$.length > 0) {
				selectedNodeId.$ = commits.$[0].rootId;
			}
		}
	});

	// Flamegraph
	const flamegraphType = valoo(FlamegraphType.TIMELINE);
	flamegraphType.on(() => {
		selectedNodeId.$ = -1;
	});

	const state: ProfilerState = {
		isRecording,
		recStartTime,
		commits,
		activeCommitIdx,
		activeCommit,
		selectedNodeId,
		selectedNode,
		flamegraphType,
	};

	return state;
}

export function startProfiling(state: ProfilerState) {
	state.isRecording.$ = true;
	state.recStartTime.$ = performance.now();
}

export function stopProfiling(state: ProfilerState) {
	state.isRecording.$ = false;
	state.recStartTime.$ = 0;
	state.activeCommitIdx.$ = 0;
	state.selectedNodeId.$ = -1;
}

export function resetProfiler(state: ProfilerState) {
	stopProfiling(state);
	state.commits.$ = [];
}

export function recordProfilerCommit(
	tree: Map<ID, DevNode>,
	profiler: ProfilerState,
	commitRootId: number,
	rootId: number,
) {
	const nodes = new Map<ID, ProfilerNode>();

	// The maximum tree depth
	let maxDepth = 0;

	// The time of the node that took the longest to render
	let maxSelfDuration = 0;

	// Make shallow copies of each node
	tree.forEach((node, id) => {
		const startTime = node.startTime;
		const endTime = node.endTime;

		const duration = endTime - startTime;

		nodes.set(id, {
			...node,
			startTime,
			endTime,
			duration,
			selfDuration: duration, // Will be filled out later
		});

		// Update maxDepth if needed
		if (maxDepth < node.depth) {
			maxDepth = node.depth;
		}
	});

	// Calculate self-durations
	// TODO: Optimize this by iterating over a presorted array
	//   and combining it with the above calculation
	nodes.forEach(node => {
		let selfDuration = node.duration;
		node.children.forEach(childId => {
			const child = nodes.get(childId);
			if (child) {
				selfDuration -= child.duration;
			}
		});

		// Update maxDuration if needed
		if (maxSelfDuration < selfDuration) {
			maxSelfDuration = selfDuration;
		}

		node.selfDuration = selfDuration;
	});

	// Total commit duration
	let duration = 0;
	const root = nodes.get(rootId);
	if (root) {
		duration = root.duration;
	}

	profiler.commits.update(arr => {
		arr.push({
			rootId,
			commitRootId,
			nodes,
			maxDepth,
			maxSelfDuration,
			duration,
		});
	});
}
