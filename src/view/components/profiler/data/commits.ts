import { ID, DevNode } from "../../../store/types";
import { Signal, signal, watch } from "../../../valoo";
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
	RANKED = "RANKED",
}

export interface ProfilerState {
	/**
	 * Flag to indicate if profiling is supported by the attached renderer.
	 */
	isSupported: Signal<boolean>;

	// Render reasons
	supportsRenderReasons: Signal<boolean>;
	captureRenderReasons: Signal<boolean>;
	setRenderReasonCapture: (v: boolean) => void;

	// Highlight updates
	highlightUpdates: Signal<boolean>;

	/**
	 * Flag that indicates if we are currently
	 * recording commits to be displayed in the
	 * profiler.
	 */
	isRecording: Signal<boolean>;
	commits: Signal<CommitData[]>;

	// Selection
	activeCommitIdx: Signal<number>;
	activeCommit: Signal<CommitData | null>;
	selectedNodeId: Signal<ID>;
	selectedNode: Signal<DevNode | null>;

	// Render reasons
	renderReasons: Signal<Map<ID, RenderReasonMap>>;
	activeReason: Signal<RenderReasonData | null>;

	// View state
	flamegraphType: Signal<FlamegraphType>;

	// Flamegraph mode
	flamegraphNodes: Signal<Map<ID, NodeTransform>>;
	rankedNodes: Signal<NodeTransform[]>;
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
	const commits = signal<CommitData[]>([]);
	const isSupported = signal(false);

	// Render Reasons
	const supportsRenderReasons = signal(false);
	const renderReasons = signal<Map<ID, RenderReasonMap>>(new Map());
	const captureRenderReasons = signal(false);
	const setRenderReasonCapture = (v: boolean) => {
		captureRenderReasons.value = v;
	};

	// Highlight updates
	const showUpdates = signal(false);

	// Selection
	const activeCommitIdx = signal(0);
	const selectedNodeId = signal(0);
	const activeCommit = watch(() => {
		return (
			(commits.value.length > 0 && commits.value[activeCommitIdx.value]) || null
		);
	});
	const selectedNode = watch(() => {
		return activeCommit.value != null
			? activeCommit.value.nodes.get(selectedNodeId.value) || null
			: null;
	});

	// Flamegraph
	const flamegraphType = signal(FlamegraphType.FLAMEGRAPH);
	flamegraphType.on(() => {
		selectedNodeId.value = activeCommit.value
			? getCommitInitalSelectNodeId(activeCommit.value, flamegraphType.value)
			: -1;
	});

	// Recording
	const isRecording = signal(false);
	isRecording.on(v => {
		// Clear current selection and profiling data when
		// a new recording starts.
		if (v) {
			commits.value = [];
			activeCommitIdx.value = 0;
			selectedNodeId.value = 0;
		} else {
			// Reset selection when recording stopped
			// and new profiling data was collected.
			if (commits.value.length > 0) {
				selectedNodeId.value = getCommitInitalSelectNodeId(
					commits.value[0],
					flamegraphType.value,
				);
			}
		}
	});

	// Render reasons
	const activeReason = watch(() => {
		if (activeCommit.value !== null) {
			const commitId = activeCommit.value.commitRootId;
			const reason = renderReasons.value.get(commitId);
			if (reason) {
				return reason.get(selectedNodeId.value) || null;
			}
		}

		return null;
	});

	// FlamegraphNode
	const flamegraphNodes = watch<Map<ID, NodeTransform>>(() => {
		const commit = activeCommit.value;
		if (!commit || flamegraphType.value !== FlamegraphType.FLAMEGRAPH) {
			return new Map();
		}

		for (let i = activeCommitIdx.value - 1; i >= 0; i--) {
			if (i >= commits.value.length) {
				return new Map();
			}
		}

		return patchTree(commit);
	});

	const rankedNodes = watch<NodeTransform[]>(() => {
		const commit = activeCommit.value;
		if (!commit || flamegraphType.value !== FlamegraphType.RANKED) {
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
	state.isRecording.value = false;
	state.activeCommitIdx.value = 0;
	state.selectedNodeId.value = -1;
}

export function resetProfiler(state: ProfilerState) {
	stopProfiling(state);
	state.commits.value = [];
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
	const commits = profiler.commits.value;
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
			duration: totalCommitDuration,
			selfDurations,
		});
	});
}
