import { expect } from "vitest";
import { DevNodeType, Tree } from "../../../store/types";
import {
	createProfiler,
	recordProfilerCommit,
	resetProfiler,
	startProfiling,
} from "./commits";

function node(id: number, parent: number, children: number[] = []) {
	return {
		children,
		depth: parent === -1 ? 0 : 1,
		endTime: id === 1 ? 10 : 7,
		hocs: null,
		id,
		key: null,
		name: `Node${id}`,
		owner: -1,
		parent,
		startTime: id === 1 ? 0 : 2,
		type: DevNodeType.FunctionComponent,
	};
}

function createTree() {
	const tree: Tree = new Map();
	tree.set(1, node(1, -1, [2]));
	tree.set(2, node(2, 1));
	return tree;
}

describe("profiler commits", () => {
	it("bumps commitsVersion for in-place commit appends", () => {
		const profiler = createProfiler();
		const tree = createTree();
		const commits = profiler.commits.value;
		const version = profiler.commitsVersion.value;

		recordProfilerCommit(tree, profiler, new Set([1, 2]), 1);

		expect(profiler.commits.value).to.equal(commits);
		expect(profiler.commits.value.length).to.equal(1);
		expect(profiler.commitsVersion.value).to.equal(version + 1);
		expect(profiler.activeCommit.value).to.equal(profiler.commits.value[0]);

		recordProfilerCommit(tree, profiler, new Set([2]), 2);

		expect(profiler.commits.value).to.equal(commits);
		expect(profiler.commits.value.length).to.equal(2);
		expect(profiler.commitsVersion.value).to.equal(version + 2);
	});

	it("clears commits and bumps commitsVersion when profiling restarts or resets", () => {
		const profiler = createProfiler();
		recordProfilerCommit(createTree(), profiler, new Set([1, 2]), 1);

		const afterRecord = profiler.commitsVersion.value;
		startProfiling(profiler);

		expect(profiler.isRecording.value).to.equal(true);
		expect(profiler.commits.value).to.deep.equal([]);
		expect(profiler.commitsVersion.value).to.equal(afterRecord + 1);

		recordProfilerCommit(createTree(), profiler, new Set([1]), 1);
		const afterSecondRecord = profiler.commitsVersion.value;
		resetProfiler(profiler);

		expect(profiler.isRecording.value).to.equal(false);
		expect(profiler.commits.value).to.deep.equal([]);
		expect(profiler.commitsVersion.value).to.equal(afterSecondRecord + 1);
	});
});
