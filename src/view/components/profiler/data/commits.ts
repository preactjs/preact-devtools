import { ID, DevNode } from "../../../store/types";
import { Observable, valoo, watch } from "../../../valoo";
import {
	RenderReasonMap,
	RenderReasonData,
} from "../../../../adapter/shared/renderReasons";
import { ProfilerCommit, ProfilerNode, ProfilerNodeShared } from "./profiler2";

/**
 * The Flamegraph supports these distinct
 * view modes.
 */
export enum FlamegraphType {
	FLAMEGRAPH = "FLAMEGRAPH",
	RANKED = "RANKED",
}

export interface ProfilerStore {
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
	currentSelfDurations: Map<ID, number>;

	/**
	 * Flag that indicates if we are currently
	 * recording commits to be displayed in the
	 * profiler.
	 */
	isRecording: Observable<boolean>;

	// Selection
	activeCommitIdx: Observable<number>;
	activeCommit: Observable<ProfilerCommit | null>;
	/** This should be treated as readonly */
	selectedNodeId: Observable<ID | -1>;
	derivedSelectedNodeId: Observable<ID | -1>;
	selectedNode: Observable<ProfilerNodeShared | null>;

	// Render reasons
	renderReasons: Observable<Map<ID, RenderReasonMap>>;
	activeReason: Observable<RenderReasonData | null>;

	// View state
	flamegraphType: Observable<FlamegraphType>;

	commits: Observable<ProfilerCommit[]>;
	nodes: Observable<Map<ID, ProfilerNodeShared>>;
}

export function getFirstNode(commit: ProfilerCommit, mode: FlamegraphType) {
	let selId = commit.firstId;

	console.log("FIRST NODE", selId);

	if (mode === FlamegraphType.RANKED) {
		let selfDuration = -1;
		commit.rendered.forEach(id => {
			const ms = commit.selfDurations.get(id);
			if (ms === undefined) return;

			if (ms > selfDuration) {
				selfDuration = ms;
				selId = id;
			}
		});

		console.log("RANKED", selId);
	}

	return selId;
}

/**
 * Create a new profiler instance. It intentiall doesn't have
 * any methods, to not go down the OOP rabbit hole.
 */
export function createProfiler(): ProfilerStore {
	const commits = valoo<ProfilerCommit[]>([]);
	const nodes = valoo<Map<ID, ProfilerNodeShared>>(new Map());

	const currentSelfDurations = new Map<ID, number>();
	const isSupported = valoo(false);

	// Render Reasons
	const supportsRenderReasons = valoo(false);
	const renderReasons = valoo<Map<ID, RenderReasonMap>>(new Map());
	const captureRenderReasons = valoo(false);
	const setRenderReasonCapture = (v: boolean) => {
		captureRenderReasons.$ = v;
	};

	// Highlight updates
	const highlightUpdates = valoo(false);

	// Selection
	const activeCommitIdx = valoo(0);
	const activeCommit = watch<ProfilerCommit | null>(() => {
		return commits.$[activeCommitIdx.$] || null;
	});
	const selectedNodeId = valoo(0);
	const derivedSelectedNodeId = watch(() => {
		const selected = selectedNodeId.$;
		const commit = activeCommit.$;
		if (selected !== -1 || commit === null) {
			return selected;
		}

		const mode = flamegraphType.$;

		if (mode === FlamegraphType.RANKED) {
			if (!commit.rendered.has(selectedNodeId.$)) {
				return getFirstNode(commit, mode);
			}
		} else if (!commit.nodes.has(selectedNodeId.$)) {
			return getFirstNode(commit, mode);
		}

		return -1;
	});

	const selectedNode = watch(() => {
		const commit = activeCommit.$;
		const selected = derivedSelectedNodeId.$;
		if (!commit || selected === -1) return null;

		return commit.nodes.get(selected)!;
	});

	// Flamegraph
	const flamegraphType = valoo(FlamegraphType.FLAMEGRAPH);

	// Recording
	const isRecording = valoo(false);
	isRecording.on(v => {
		// Clear current selection and profiling data when
		// a new recording starts.
		if (v) {
			commits.$ = [];
			nodes.$ = new Map();
			activeCommitIdx.$ = 0;
			selectedNodeId.$ = -1;
		} else {
			// Reset selection when recording stopped
			// and new profiling data was collected.
			if (commits.$.length > 0) {
				selectedNodeId.$ = -1;
			}
		}
	});

	// Render reasons
	const activeReason = watch(() => {
		return null;
	});

	return {
		supportsRenderReasons,
		captureRenderReasons,
		setRenderReasonCapture,
		currentSelfDurations,
		highlightUpdates,
		isSupported,
		isRecording,

		// The actual data
		commits,
		nodes,

		// Derived data
		activeCommitIdx,
		activeCommit,
		renderReasons,
		activeReason,
		selectedNodeId,
		derivedSelectedNodeId,
		selectedNode,

		// Rendering
		flamegraphType,
	};
}

export function stopProfiling(state: ProfilerStore) {
	state.isRecording.$ = false;
	state.activeCommitIdx.$ = 0;
	state.selectedNodeId.$ = -1;
}

export function resetProfiler(state: ProfilerStore) {
	stopProfiling(state);
	state.commits.$ = [];
	state.nodes.$ = new Map();
}

export function recordProfilerCommit(
	tree: Map<ID, DevNode>,
	profiler: ProfilerStore,
	rendered: ID[],
	reasons: RenderReasonMap,
) {
	const shared = profiler.nodes.$;

	const pNodes = new Map<ID, ProfilerNode>();

	for (let i = 0; i < rendered.length; i++) {
		const id = rendered[i];

		const node = tree.get(id);
		if (!node) continue; // Should never happen

		if (!shared.has(id)) {
			shared.set(id, {
				id,
				hocs: node.hocs,
				name: node.name,
				type: node.type,
			});
		}
		pNodes.set(id, {
			id,
			children: node.children.slice(),
			parent: node.parent,
		});
	}

	profiler.commits.update(commits => {
		commits.push({
			selfDurations: profiler.currentSelfDurations,
			rendered: new Set(rendered),
			start: 0, // TODO: For timeline
			nodes: pNodes,
			firstId: rendered[0],
			reasons,
		});
	});
}
