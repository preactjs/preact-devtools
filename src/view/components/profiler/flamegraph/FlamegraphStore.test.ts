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
			expect(flame.nodes.$.map(x => x.width)).to.deep.equal([600, 525, 450]);
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

			expect(flame.nodes.$.map(x => x.width)).to.deep.equal([600, 480, 360]);
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
				600,
				600,
				500.00000000000006,
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
					width: 600,
					visible: true,
					maximized: true,
					weight: 7,
				},
				{
					id: 2,
					name: "Foo",
					x: 100,
					row: 1,
					width: 400,
					visible: true,
					maximized: false,
					weight: 5,
				},
				{
					id: 3,
					name: "Bar",
					x: 200,
					row: 2,
					width: 250,
					visible: true,
					maximized: false,
					weight: 9,
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
					width: 600,
					visible: true,
					maximized: true,
					weight: 7,
				},
				{
					id: 2,
					name: "Foo",
					x: 0,
					row: 1,
					width: 600,
					visible: true,
					maximized: true,
					weight: 5,
				},
				{
					id: 3,
					name: "Bar",
					x: 150,
					row: 2,
					width: 375,
					visible: true,
					maximized: false,
					weight: 9,
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
					width: 600,
					maximized: true,
					weight: 9,
					visible: true,
				},
				{
					id: 2,
					name: "Foo",
					x: -1000.0000000000002,
					row: 1,
					width: 800.0000000000001,
					visible: false,
					maximized: false,
					weight: 3,
				},
				{
					id: 4,
					name: "Bob",
					x: 0,
					row: 1,
					width: 600,
					weight: 6,
					visible: true,
					maximized: true,
				},
				{
					id: 5,
					name: "Boof",
					x: 900,
					row: 1,
					width: 800.0000000000001,
					weight: 8,
					visible: false,
					maximized: false,
				},
				{
					id: 3,
					name: "Bar",
					x: -800.0000000000001,
					row: 2,
					width: 500.0000000000001,
					visible: false,
					maximized: false,
					weight: 5,
				},
			]);
		});
	});
});
