import { ID, DevNode } from "../../../store/types";
import { Observable, valoo, watch } from "../../../valoo";
import {
	RenderReasonMap,
	RenderReasonData,
} from "../../../../adapter/shared/renderReasons";
import { ProfilerCommit, ProfilerNode, ProfilerNodeShared } from "./profiler2";
import { getRoot } from "../flamegraph/FlamegraphStore";

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
	selectedNode: Observable<ProfilerNode | null>;

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
	} else {
		selId = getRoot(commit.nodes, commit.firstId);
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
	const selectedNodeId = valoo(-1);
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
		const commit = activeCommit.$;
		if (commit === null) return null;

		const selectedId = selectedNodeId.$;
		return commit.reasons.get(selectedId) || null;
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
	rootId: ID,
	rendered: ID[],
	removals: ID[],
	reasons: RenderReasonMap,
) {
	const shared = profiler.nodes.$;

	let pNodes: Map<ID, ProfilerNode>;

	// Initially, we need to copy the whole tree
	const commits = profiler.commits.$;
	let lastCommitSameRoot: ProfilerCommit | undefined;
	if (commits.length > 0) {
		for (let i = commits.length - 1; i >= 0; i--) {
			if (commits[i].rootId === rootId) {
				lastCommitSameRoot = commits[i];
			}
		}
	}

	if (commits.length === 0 || lastCommitSameRoot === undefined) {
		pNodes = new Map<ID, ProfilerNode>();
		const stack = [rootId];
		let id;
		while ((id = stack.pop()) !== undefined) {
			const node = tree.get(id)!;
			shared.set(id, {
				id,
				hocs: node.hocs,
				name: node.name,
				type: node.type,
			});
			pNodes.set(id, {
				id,
				children: node.children,
				parent: node.parent,
			});

			stack.push(...node.children);
		}
	} else {
		pNodes = new Map(lastCommitSameRoot.nodes);

		// Drop removals
		for (let i = 0; i < removals.length; i++) {
			const id = removals[i];
			const node = pNodes.get(id);
			if (node && node.parent !== -1) {
				const parent = pNodes.get(node.parent)!;
				const idx = parent.children.indexOf(id);
				if (idx > -1) {
					const children = parent.children.slice();
					children.splice(idx, 1);

					pNodes.set(node.parent, {
						id: parent.id,
						children,
						parent: parent.parent,
					});
				}
			}
			pNodes.delete(id);
		}

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
				children: node.children,
				parent: node.parent,
			});
		}
	}

	profiler.commits.update(commits => {
		commits.push({
			selfDurations: new Map(profiler.currentSelfDurations),
			rendered: new Set(rendered),
			start: 0, // TODO: For timeline
			nodes: pNodes,
			firstId: rendered[0],
			rootId,
			reasons,
		});
	});
}
