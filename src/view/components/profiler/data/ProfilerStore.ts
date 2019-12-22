import { valoo, watch } from "../../../valoo";
import { EmitFn } from "../../../../adapter/hook";
import { ID } from "../../../store/types";

export interface ProfilerNode {
	id: ID;
	name: string;
	/** Moment in time when the vnode started rendering */
	startTime: number;
	/** The time it took the vnode and all its children to render */
	duration: number;
	/** Render time of vnode without children */
	selfDuration: number;
	depth: number;
	children: ID[];
}

const mockCommits: ProfilerNode[][] = [
	[
		{
			id: 1,
			name: "App",
			startTime: 0,
			duration: 2,
			selfDuration: 0.5,
			depth: 0,
			children: [2, 3],
		},
		{
			id: 2,
			name: "Foo",
			startTime: 0.5,
			duration: 1,
			depth: 1,
			selfDuration: 1,
			children: [1],
		},
		{
			id: 3,
			name: "Bob",
			startTime: 0.75,
			duration: 0.2,
			depth: 2,
			selfDuration: 0.2,
			children: [],
		},
		{
			id: 4,
			name: "Bar",
			startTime: 1.5,
			duration: 0.5,
			selfDuration: 0.5,
			depth: 1,
			children: [],
		},
	],
];

mockCommits.push(JSON.parse(JSON.stringify(mockCommits[0])));
mockCommits[1][0].duration = 50;
mockCommits[1][0].selfDuration = 48.5;

export enum DisplayType {
	FLAMEGRAPH = "FLAMEGRAPH",
	RANKED = "RANKED",
}

export function createProfilerStore(emit: EmitFn) {
	const commits = valoo<ProfilerNode[][]>(mockCommits);
	const selected = valoo(0);
	const selectedNode = valoo(0);
	selected.on(() => (selectedNode.$ = 0));

	const isRecording = valoo(false);
	const recordingStartTime = valoo<number>(0);

	isRecording.on(v => {
		if (v) {
			commits.$ = [];
			selected.$ = 0;
			recordingStartTime.$ = performance.now();
		}
	});

	const slowestCommit = watch(() => {
		let max = 0;
		for (let i = 0; i < commits.$.length; i++) {
			const commit = commits.$[i];
			if (commit.length > 0 && commit[0].duration > max) {
				max = commit[0].duration;
			}
		}
		return max;
	});

	const currentCommit = watch(() => {
		if (!commits.$.length) return null;
		return commits.$[selected.$] || null;
	});

	const maxDepth = watch(() => {
		return Math.max(0, ...(currentCommit.$ || []).map(x => x.depth));
	});

	const slowestNode = watch(() => {
		return Math.max(0, ...(currentCommit.$ || []).map(x => x.selfDuration));
	});

	const ranked = watch(() => {
		return (currentCommit.$ || [])
			.slice()
			.sort((a, b) => b.selfDuration - a.selfDuration);
	});

	isRecording.on(v => emit(v ? "start-profiling" : "stop-profiling", null));

	const displayType = valoo<DisplayType>(DisplayType.FLAMEGRAPH);
	displayType.on(() => {
		selectedNode.$ = 0;
	});

	const selectedNodeData = watch(() => {
		if (displayType.$ === DisplayType.FLAMEGRAPH) {
			if (currentCommit.$ === null) return null;
			return currentCommit.$[selectedNode.$] || null;
		} else {
			return ranked.$[selectedNode.$] || null;
		}
	});

	const clear = () => {
		commits.$ = [];
		selected.$ = 0;
		isRecording.$ = false;
		recordingStartTime.$ = 0;
		emit("clear-profiling", null);
	};

	return {
		displayType,
		ranked,
		maxDepth,
		clear,
		currentCommit,
		slowestCommit,
		slowestNode,
		commits,
		selected,
		selectedNodeData,
		selectedNode,
		isRecording,
		recordingStartTime,
	};
}
