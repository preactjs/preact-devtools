import { ID, DevNode } from "../../../store/types";
import { computed, Observable, valoo } from "../../../preact-signals";
import { getRoot } from "../flamegraph/FlamegraphStore";
import {
	RenderReasonMap,
	RenderReasonData,
} from "../../../../adapter/shared/renderReasons";
import { patchTree } from "../flamegraph/modes/patchTree";
import { NodeTransform } from "../flamegraph/shared";
import { toTransform } from "../flamegraph/ranked/ranked-utils";

export interface CommitData {
	/** Id of the tree's root node */
	rootId: ID;
	/** Id of the node the commit was triggered on */
	commitRootId: ID;
	/** Nodes that are part of the current commit */
	rendered: Set<ID>;
	maxSelfDuration: number;
	duration: number;
	nodes: Map<ID, DevNode>;
	selfDurations: Map<ID, number>;
}

/**
 * The Flamegraph supports these distinct
 * view modes.
 */
export enum FlamegraphType {
	FLAMEGRAPH = "FLAMEGRAPH",
	TIMELINE = "TIMELINE",
	RANKED = "RANKED",
}

export interface ProfilerState {
	/**
	 * Flag to indicate if profiling is supported by the attached renderer.
	 */
	isSupported: Observable<boolean>;

	// Render reasons
	supportsRenderReasons: Observable<boolean>;
	captureRenderReasons: Observable<boolean>;
	setRenderReasonCapture: (v: boolean) => void;

	// Highlight updates
	highlightUpdates: Observable<boolean>;

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
	selectedNode: Observable<DevNode | null>;

	// Render reasons
	renderReasons: Observable<Map<ID, RenderReasonMap>>;
	activeReason: Observable<RenderReasonData | null>;

	// View state
	flamegraphType: Observable<FlamegraphType>;

	// Flamegraph mode
	flamegraphNodes: Observable<Map<ID, NodeTransform>>;
	rankedNodes: Observable<NodeTransform[]>;
}

function getMaxSelfDurationNode(commit: CommitData) {
	let id = commit.commitRootId;
	let max = commit.selfDurations.get(id) || 0;

	commit.rendered.forEach(rId => {
		const t = commit.selfDurations.get(rId) || 0;
		if (t > max) {
			max = t;
			id = rId;
		}
	});

	return id;
}

export function getCommitInitalSelectNodeId(
	commit: CommitData,
	type: FlamegraphType,
) {
	return type === FlamegraphType.FLAMEGRAPH
		? commit.commitRootId
		: getMaxSelfDurationNode(commit);
}

/**
 * Create a new profiler instance. It intentiall doesn't have
 * any methods, to not go down the OOP rabbit hole.
 */
export function createProfiler(): ProfilerState {
	const commits = valoo<CommitData[]>([]);
	commits.name = "commits";
	const isSupported = valoo(false);
	isSupported.name = "isSupported";

	// Render Reasons
	const supportsRenderReasons = valoo(false);
	supportsRenderReasons.name = "supportsRenderReasons";
	const renderReasons = valoo<Map<ID, RenderReasonMap>>(new Map());
	renderReasons.name = "renderReasons";
	const captureRenderReasons = valoo(false);
	captureRenderReasons.name = "captureRenderReasons";
	const setRenderReasonCapture = (v: boolean) => {
		captureRenderReasons.$ = v;
	};

	// Highlight updates
	const showUpdates = valoo(false);
	showUpdates.name = "showUpdates";

	// Selection
	const activeCommitIdx = valoo(0);
	activeCommitIdx.name = "activeCommitIdx";
	const selectedNodeId = valoo(0);
	selectedNodeId.name = "selectedNodeId";
	const activeCommit = computed(() => {
		if (isRecording.$) return null;
		return (commits.$.length > 0 && commits.$[activeCommitIdx.$]) || null;
	});
	activeCommit.name = "activeCommit";
	const selectedNode = computed(() => {
		return activeCommit.$ != null
			? activeCommit.$.nodes.get(selectedNodeId.$) || null
			: null;
	});
	selectedNode.name = "selectedNode";

	// Flamegraph
	const flamegraphType = valoo(FlamegraphType.FLAMEGRAPH);

	// Recording
	const isRecording = valoo(false);
	isRecording.name = "isRecording";

	// Render reasons
	const activeReason = computed(() => {
		if (activeCommit.$ !== null) {
			const commitId = activeCommit.$.commitRootId;
			const reason = renderReasons.$.get(commitId);
			if (reason) {
				return reason.get(selectedNodeId.$) || null;
			}
		}

		return null;
	});
	activeReason.name = "activeReason";

	// FlamegraphNode
	const flamegraphNodes = computed<Map<ID, NodeTransform>>(() => {
		const commit = activeCommit.$;
		if (!commit || flamegraphType.$ !== FlamegraphType.FLAMEGRAPH) {
			return new Map();
		}

		for (let i = activeCommitIdx.$ - 1; i >= 0; i--) {
			if (i >= commits.$.length) {
				return new Map();
			}
		}

		return patchTree(commit);
	});
	flamegraphNodes.name = "flamegraphNodes";

	const rankedNodes = computed<NodeTransform[]>(() => {
		const commit = activeCommit.$;
		if (!commit || flamegraphType.$ !== FlamegraphType.RANKED) {
			return [];
		}

		return toTransform(commit);
	});
	rankedNodes.name = "rankedNodes";

	return {
		supportsRenderReasons,
		captureRenderReasons,
		setRenderReasonCapture,
		highlightUpdates: showUpdates,
		isSupported,
		isRecording,
		commits,
		activeCommitIdx,
		activeCommit,
		renderReasons,
		activeReason,
		selectedNodeId,
		selectedNode,

		// Rendering
		flamegraphType,
		flamegraphNodes,
		rankedNodes,
	};
}

export function startProfiling(state: ProfilerState) {
	state.isRecording.$ = true;
	state.commits.$ = [];
	state.activeCommitIdx.$ = 0;
	state.selectedNodeId.$ = 0;
}

export function stopProfiling(state: ProfilerState) {
	state.isRecording.$ = false;
	state.activeCommitIdx.$ = 0;
	// Reset selection when recording stopped
	// and new profiling data was collected.
	if (state.commits.$.length > 0) {
		state.selectedNodeId.$ = getCommitInitalSelectNodeId(
			state.commits.$[0],
			state.flamegraphType.$,
		);
	} else {
		state.selectedNodeId.$ = -1;
	}
}

export function resetProfiler(state: ProfilerState) {
	stopProfiling(state);
	state.commits.$ = [];
}

export function recordProfilerCommit(
	tree: Map<ID, DevNode>,
	profiler: ProfilerState,
	rendered: Set<ID>,
	commitRootId: number,
) {
	const nodes = new Map<ID, DevNode>();

	// The time of the node that took the longest to render
	let maxSelfDuration = 0;
	let totalCommitDuration = 0;
	const selfDurations = new Map<ID, number>();

	const rootId = getRoot(tree, commitRootId);

	// Find previous commit to copy over timing data later
	const commits = profiler.commits.$;
	let prevCommit: CommitData | undefined;
	for (let i = commits.length - 1; i >= 0; i--) {
		if (commits[i].rootId === rootId) {
			prevCommit = commits[i];
			break;
		}
	}

	// Traverse nodes from the actual root to be able to build
	// the full tree.
	const stack = [rootId];
	let id: ID | undefined;
	while ((id = stack.pop())) {
		const node = tree.get(id);
		if (!node) continue;

		if (rendered.has(node.id)) {
			// Collect the time a node took to render excluding its children
			let selfDuration = node.endTime - node.startTime;
			for (let i = 0; i < node.children.length; i++) {
				const childId = node.children[i];

				if (rendered.has(childId)) {
					const child = tree.get(childId)!;
					selfDuration -= child.endTime - child.startTime;
				}
			}

			if (selfDuration > maxSelfDuration) {
				maxSelfDuration = selfDuration;
			}
			totalCommitDuration += selfDuration;
			selfDurations.set(node.id, selfDuration);
		} else if (prevCommit) {
			// Otherwise just copy over the duration from the previous commit
			// of that root id.
			selfDurations.set(node.id, prevCommit.selfDurations.get(node.id) || 0);
		}

		nodes.set(node.id, node);

		stack.push(...node.children);
	}

	// Very useful to grab test cases from live websites
	// console.groupCollapsed("patch");
	// console.log("====", commitRoot.name, commitRootId);
	// console.log(JSON.stringify(Array.from(nodes.values())));
	// console.groupEnd();

	profiler.commits.value = [
		...profiler.commits.value,
		{
			rootId: getRoot(tree, commitRootId),
			commitRootId: commitRootId,
			rendered,
			nodes,
			maxSelfDuration,
			duration: totalCommitDuration,
			selfDurations,
		},
	];
}
