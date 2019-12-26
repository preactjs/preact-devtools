import { expect } from "chai";
import {
	createProfiler2,
	FlamegraphType,
	ProfilerNode,
} from "../../../store/commits";
import { createFlameGraphStore } from "./FlamegraphStore";
import { DevNodeType, ID } from "../../../store/types";

const defaultTree = new Map<ID, ProfilerNode>([
	[
		1,
		{
			id: 1,
			key: "",
			type: DevNodeType.FunctionComponent,
			startTime: 1,
			endTime: 25,
			duration: 25,
			selfDuration: 5,
			children: [2, 3],
			name: "App",
			parent: 0,
			depth: 0,
		},
	],
	[
		2,
		{
			id: 2,
			key: "",
			type: DevNodeType.FunctionComponent,
			duration: 5,
			selfDuration: 5,
			children: [],
			name: "Foo",
			parent: 1,
			startTime: 5,
			endTime: 10,
			depth: 1,
		},
	],
	[
		3,
		{
			id: 3,
			key: "",
			type: DevNodeType.FunctionComponent,
			duration: 15,
			selfDuration: 15,
			children: [],
			name: "Bar",
			parent: 1,
			startTime: 10,
			endTime: 25,
			depth: 1,
		},
	],
]);

describe("FlameGraphStore", () => {
	let profiler: ReturnType<typeof createProfiler2>;
	let flame: ReturnType<typeof createFlameGraphStore>;

	beforeEach(() => {
		profiler = createProfiler2();
		flame = createFlameGraphStore(profiler);
		profiler.activeCommitIdx.$ = 0;
	});

	it("should be empty when no commits", () => {
		expect(flame.nodes.$).to.deep.equal([]);
	});

	describe("ranked mode", () => {
		beforeEach(() => {
			profiler.flamegraphType.$ = FlamegraphType.RANKED;
			profiler.selectedNodeId.$ = 1;
		});

		it("should always set x = 0", () => {
			profiler.commits.$ = [
				{
					rootId: 1,
					commitRootId: 1,
					duration: 20,
					maxSelfDuration: 10,
					maxDepth: 1,
					nodes: new Map(defaultTree),
				},
			];
			expect(flame.nodes.$.map(x => x.x)).to.deep.equal([0, 0, 0]);
		});

		it("should rank nodes by selfDuration", () => {
			profiler.commits.$ = [
				{
					rootId: 1,
					commitRootId: 1,
					duration: 20,
					maxSelfDuration: 10,
					maxDepth: 1,
					nodes: new Map(defaultTree),
				},
			];
			expect(flame.nodes.$.map(x => x.id)).to.deep.equal([3, 1, 2]);
		});
	});
});
