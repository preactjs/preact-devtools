import { expect } from "chai";
import { createProfiler, FlamegraphType } from "../data/commits";
import { createFlameGraphStore } from "./FlamegraphStore";
import { flames } from "./testHelpers";

describe("FlameGraphStore", () => {
	let profiler: ReturnType<typeof createProfiler>;
	let flame: ReturnType<typeof createFlameGraphStore>;

	beforeEach(() => {
		profiler = createProfiler();
		flame = createFlameGraphStore(profiler);
		profiler.activeCommitIdx.$ = 0;
	});

	it("should be empty when no commits", () => {
		expect(flame.nodes.$).to.deep.equal([]);
	});

	describe("ranked mode", () => {
		beforeEach(() => {
			profiler.flamegraphType.$ = FlamegraphType.RANKED;
			profiler.commits.on(commits => {
				if (commits.length > 0) {
					const list = Array.from(commits[0].nodes.values());
					let max = list[0]!;
					for (let i = 0; i < list.length; i++) {
						const item = list[i];
						if (max.selfDuration < item.selfDuration) {
							max = item;
						}
					}
					profiler.selectedNodeId.$ = max.id;
				}
			});
		});

		it("should always set x = 0", () => {
			const tree = flames`
				App ***************
				  Foo **   Bar ***
			`;
			profiler.commits.$ = [tree.commit];
			expect(flame.nodes.$.map(x => x.x)).to.deep.equal([0, 0, 0]);
		});

		it("should rank nodes by selfDuration", () => {
			const tree = flames`
				App *****************
				  Foo **   Bar ***
			`;
			profiler.commits.$ = [tree.commit];
			expect(flame.nodes.$.map(x => tree.idMap.get(x.id)!.name)).to.deep.equal([
				"App",
				"Bar",
				"Foo",
			]);
		});

		it("should calculate width", () => {
			const tree = flames`
					App *****************
						Foo **   Bar ***
				`;
			profiler.commits.$ = [tree.commit];
			expect(flame.nodes.$.map(x => x.width)).to.deep.equal([80, 70, 60]);
		});

		it("should rank nodes by selfDuration #2", () => {
			const tree = flames`
				App *****************
				  Foo **   Bar ******
			`;
			profiler.commits.$ = [tree.commit];
			expect(flame.nodes.$.map(x => tree.idMap.get(x.id)!.name)).to.deep.equal([
				"Bar",
				"Foo",
				"App",
			]);
		});

		it("should calculate widths", () => {
			const tree = flames`
				App ********************
				  Foo ****   Bar ******
			`;
			profiler.commits.$ = [tree.commit];

			expect(flame.nodes.$.map(x => x.width)).to.deep.equal([100, 80, 60]);
		});

		it("should support maximizing nodes", () => {
			const tree = flames`
				App *****************
				  Foo **   Bar ******
			`;
			profiler.commits.$ = [tree.commit];
			profiler.selectedNodeId.$ = 2;

			expect(flame.nodes.$.map(x => tree.idMap.get(x.id)!.name)).to.deep.equal([
				"Bar",
				"Foo",
				"App",
			]);

			expect(flame.nodes.$.map(x => x.width)).to.deep.equal([
				100,
				100,
				83.33333333333334,
			]);
		});
	});

	describe("timeline mode", () => {
		beforeEach(() => {
			profiler.flamegraphType.$ = FlamegraphType.FLAMEGRAPH;
			profiler.selectedNodeId.$ = 1;
		});

		it("should position nodes", () => {
			const tree = flames`
				App ********
				  Foo ****
				    Bar *
			`;
			profiler.commits.$ = [tree.commit];

			const actual = flame.nodes.$.map(x => {
				return {
					...x,
					name: tree.idMap.get(x.id)!.name,
				};
			});

			expect(actual).to.deep.equal([
				{
					id: 1,
					name: "App",
					x: 0,
					row: 0,
					width: 120,
				},
				{
					id: 2,
					name: "Foo",
					x: 20,
					row: 1,
					width: 80,
				},
				{
					id: 3,
					name: "Bar",
					x: 40,
					row: 2,
					width: 50,
				},
			]);
		});

		it("should position with maximized nodes", () => {
			const tree = flames`
				App ********
				  Foo ****
				    Bar *
			`;
			profiler.commits.$ = [tree.commit];
			profiler.selectedNodeId.$ = 2;

			const actual = flame.nodes.$.map(x => {
				return {
					...x,
					name: tree.idMap.get(x.id)!.name,
				};
			});

			expect(actual).to.deep.equal([
				{
					id: 1,
					name: "App",
					x: 0,
					row: 0,
					width: 120,
				},
				{
					id: 2,
					name: "Foo",
					x: 0,
					row: 1,
					width: 120,
				},
				{
					id: 3,
					name: "Bar",
					x: 30,
					row: 2,
					width: 75,
				},
			]);
		});

		it("should position outside node when maximized", () => {
			const tree = flames`
				App ***************************
				  Foo ****  Bob **   Boof ***
				    Bar *
			`;
			profiler.commits.$ = [tree.commit];
			profiler.selectedNodeId.$ = tree.byName("Bob")!.id;

			const actual = flame.nodes.$.map(x => {
				return {
					...x,
					name: tree.idMap.get(x.id)!.name,
				};
			});

			expect(actual).to.deep.equal([
				{
					id: 1,
					name: "App",
					x: 0,
					row: 0,
					width: 310,
				},
				{
					id: 2,
					name: "Foo",
					x: -516.6666666666667,
					row: 1,
					width: 413.33333333333337,
				},
				{
					id: 4,
					name: "Bob",
					x: 0,
					row: 1,
					width: 310,
				},
				{
					id: 5,
					name: "Boof",
					x: 465,
					row: 1,
					width: 413.33333333333337,
				},
				{
					id: 3,
					name: "Bar",
					x: -413.33333333333337,
					row: 2,
					width: 258.33333333333337,
				},
			]);
		});
	});
});
