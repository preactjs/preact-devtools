import { ID, DevNode } from "../../../store/types";
import { Observable, valoo, watch } from "../../../valoo";
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
	startTime: number;
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

/**
 * Create a new profiler instance. It intentiall doesn't have
 * any methods, to not go down the OOP rabbit hole.
 */
export function createProfiler(): ProfilerState {
	const commits = valoo<CommitData[]>([]);
	const isSupported = valoo(false);

	// Render Reasons
	const supportsRenderReasons = valoo(false);
	const renderReasons = valoo<Map<ID, RenderReasonMap>>(new Map());
	const captureRenderReasons = valoo(false);
	const setRenderReasonCapture = (v: boolean) => {
		captureRenderReasons.$ = v;
	};

	// Highlight updates
	const showUpdates = valoo(false);

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

	// Flamegraph
	const flamegraphType = valoo(FlamegraphType.FLAMEGRAPH);
	flamegraphType.on(type => {
		selectedNodeId.$ =
			type === FlamegraphType.FLAMEGRAPH && activeCommit.$
				? activeCommit.$.rootId
				: -1;
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
				selectedNodeId.$ =
					flamegraphType.$ === FlamegraphType.FLAMEGRAPH
						? commits.$[0].rootId
						: commits.$[0].commitRootId;
			}
		}
	});

	// Render reasons
	const activeReason = watch(() => {
		if (activeCommit.$ !== null) {
			const commitId = activeCommit.$.commitRootId;
			const reason = renderReasons.$.get(commitId);
			if (reason) {
				return reason.get(selectedNodeId.$) || null;
			}
		}

		return null;
	});

	// FlamegraphNode
	const flamegraphNodes = watch<Map<ID, NodeTransform>>(() => {
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

	const rankedNodes = watch<NodeTransform[]>(() => {
		const commit = activeCommit.$;
		if (!commit || flamegraphType.$ !== FlamegraphType.RANKED) {
			return [];
		}

		return toTransform(commit);
	});

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
	rendered: Set<ID>,
	commitRootId: number,
	startTime: number,
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

	profiler.commits.update(arr => {
		arr.push({
			rootId: getRoot(tree, commitRootId),
			commitRootId: commitRootId,
			rendered,
			nodes,
			maxSelfDuration,
			startTime,
			duration: totalCommitDuration,
			selfDurations,
		});
	});
}
