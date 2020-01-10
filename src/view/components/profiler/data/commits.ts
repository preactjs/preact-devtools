import { ID, DevNode } from "../../../store/types";
import { Observable, valoo, watch } from "../../../valoo";
import { resizeToMin } from "../flamegraph/transform/resizeToMin";
import { getRoot } from "../flamegraph/FlamegraphStore";

export interface ProfilerNode extends DevNode {
	selfDuration: number;
	duration: number;
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

/**
 * The Flamegraph supports these distinct
 * view modes.
 */
export enum FlamegraphType {
	FLAMEGRAPH = "FLAMEGRAPH",
	RANKED = "RANKED",
}

export interface ProfilerState {
	/**
	 * Flag that indicates if we are currently
	 * recording commits to be displayed in the
	 * profiler.
	 */
	isRecording: Observable<boolean>;
	commits: Observable<CommitData[]>;

	// Selection
	activeCommitIdx: Observable<number>;
	activeCommit: Observable<CommitData | null>;
	selectedNodeId: Observable<ID>;
	selectedNode: Observable<ProfilerNode | null>;

	// View state
	flamegraphType: Observable<FlamegraphType>;
}

/**
 * Create a new profiler instance. It intentiall doesn't have
 * any methods, to not go down the OOP rabbit hole.
 */
export function createProfiler(): ProfilerState {
	const commits = valoo<CommitData[]>([]);

	// Selection
	const activeCommitIdx = valoo(0);
	const selectedNodeId = valoo(0);
	const activeCommit = watch(() => {
		return (commits.$.length > 0 && commits.$[activeCommitIdx.$]) || null;
	});
	const selectedNode = watch(() => {
		return activeCommit.$ != null
			? activeCommit.$.nodes.get(selectedNodeId.$) || null
			: null;
	});

	// Recording
	const isRecording = valoo(false);
	isRecording.on(v => {
		// Clear current selection and profiling data when
		// a new recording starts.
		if (v) {
			commits.$ = [];
			activeCommitIdx.$ = 0;
			selectedNodeId.$ = 0;
		} else {
			// Reset selection when recording stopped
			// and new profiling data was collected.
			if (commits.$.length > 0) {
				selectedNodeId.$ = commits.$[0].rootId;
			}
		}
	});

	// Flamegraph
	const flamegraphType = valoo(FlamegraphType.FLAMEGRAPH);
	flamegraphType.on(() => {
		selectedNodeId.$ = -1;
	});

	return {
		isRecording,
		commits,
		activeCommitIdx,
		activeCommit,
		selectedNodeId,
		selectedNode,
		flamegraphType,
	};
}

export function stopProfiling(state: ProfilerState) {
	state.isRecording.$ = false;
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
	rootId: number,
) {
	const nodes = new Map<ID, ProfilerNode>();

	// The maximum tree depth
	let maxDepth = 0;

	// The time of the node that took the longest to render
	let maxSelfDuration = 0;

	// Make shallow copies of each node
	tree.forEach((node, id) => {
		nodes.set(id, {
			// deep clone
			...JSON.parse(JSON.stringify(node)),
			duration: node.endTime - node.startTime,
			selfDuration: -1, // Will be set later
		});

		// Update maxDepth if needed
		if (maxDepth < node.depth) {
			maxDepth = node.depth;
		}
	});

	// Nodes may have a timing duration of 0 due to lack of precision
	// in high performance timers because of spectre CPU attack vectors.
	// We'll assign a minimum width to those nodes.
	resizeToMin(nodes, 0.1);

	// Calculate self-durations
	// TODO: Optimize this by iterating over a presorted array
	//   and combining it with the above calculation
	nodes.forEach(node => {
		let selfDuration = node.treeEndTime - node.treeStartTime;
		node.children.forEach(childId => {
			const child = nodes.get(childId);
			if (child) {
				selfDuration = selfDuration - (child.treeEndTime - child.treeStartTime);
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
		duration = root.treeEndTime - root.treeStartTime;
	}

	profiler.commits.update(arr => {
		arr.push({
			rootId: getRoot(tree, rootId),
			commitRootId: rootId,
			nodes,
			maxDepth,
			maxSelfDuration,
			duration,
		});
	});
}
