import { expect } from "chai";
import { patchTree, FlameTree } from "./patchTree";
import { flames } from "../testHelpers";
import { Tree, DevNode, ID } from "../../../../store/types";
import * as patch1 from "./fixtures/patch1";
import * as patch2 from "./fixtures/patch2";
import * as patch3 from "./fixtures/patch3";
import * as patch4 from "./fixtures/patch4";
import * as patch5 from "./fixtures/patch5";

export function toTimings(tree: Tree, flame: FlameTree) {
	return Array.from(flame.values())
		.map(x => {
			const node = tree.get(x.id)!;
			return {
				id: x.id,
				name: node.name,
				children: node.children,
				start: x.start,
				end: x.end,
			};
		})
		.sort((a, b) => a.id - b.id);
}

export function patch(tree: Tree, rootId: ID, commitRootId: ID) {
	return toTimings(
		tree,
		patchTree(null, {
			nodes: tree,
			rootId,
			commitRootId,
			duration: 100,
			maxSelfDuration: 100,
			selfDurations: new Map(),
		}),
	);
}

export function byName(tree: Tree, name: string) {
	return Array.from(tree.values()).find(node => node.name === name);
}

export function prepareFixture(fixture: {
	previous: DevNode[];
	next: DevNode[];
	expected: ReturnType<typeof toTimings>;
}) {
	const { previous, next, expected } = fixture;
	return {
		previous: new Map(previous.map(node => [node.id, node])),
		previousRoot: previous.length ? previous[0].id : -42,
		next: new Map(next.map(node => [node.id, node])),
		nextRoot: next[0].id,
		expected,
	};
}

describe.only("patchTree", () => {
	it("should return work with no data", () => {
		const res = patch(new Map(), 1, 1);
		expect(res.length).to.equal(0);
	});

	it("should offset timings if tree is new", () => {
		const b = flames`
			App *******
				Bar **
		`;

		b.nodes.forEach(x => {
			x.startTime += 200;
			x.endTime += 200;
		});

		const actual = patch(b.idMap, 1, 1);
		expect(actual).to.deep.equal([
			{ name: "App", id: 1, start: 0, end: 110, children: [2] },
			{ name: "Bar", id: 2, start: 10, end: 70, children: [] },
		]);
	});

	it("should expand tree", () => {
		const tree = flames`
			App **
			 Bar ***
			 	Bob *
		`;

		const actual = patch(tree.idMap, 1, 2);
		expect(actual).to.deep.equal([
			{ name: "App", id: 1, start: 0, end: 80, children: [2] },
			{ name: "Bar", id: 2, start: 10, end: 80, children: [3] },
			{ name: "Bob", id: 3, start: 20, end: 70, children: [] },
		]);
	});

	it("should fix positive offset tree", () => {
		const b = flames`
			App *****
			 Bar ***
			  Bob *
		`;

		b.nodes.forEach(x => {
			if (x.name !== "App") {
				x.startTime += 100;
				x.endTime += 100;
			}
		});

		const actual = patch(b.idMap, 1, 1);
		expect(actual).to.deep.equal([
			{ name: "App", id: 1, start: 0, end: 90, children: [2] },
			{ name: "Bar", id: 2, start: 0, end: 70, children: [3] },
			{ name: "Bob", id: 3, start: 10, end: 60, children: [] },
		]);
	});

	it("should mount with filtered parent", () => {
		const a = flames`
			App ******
		`;

		const b = flames`
			App *****
			 Bar ***
			  Bob *
		`;

		// Children are fixed during ops parsing
		a.nodes[0].children = [2];

		b.nodes.forEach(x => {
			x.startTime += 100;
			x.endTime += 100;
		});

		const actual = patch(a.idMap, 1, 2);
		expect(actual).to.deep.equal([
			{ name: "App", id: 1, start: 0, end: 90, children: [2] },
			{ name: "Bar", id: 2, start: 10, end: 80, children: [3] },
			{ name: "Bob", id: 3, start: 20, end: 70, children: [] },
		]);
	});

	it("should move siblings to the right", () => {
		const a = flames`
			App ***********
			 Bar **
		`;

		const b = flames`
			App ***********
			 Bob *  Bar **
		`;

		// Correct ids to simulate update
		b.byName("App")!.children = [3, 2];
		b.byName("Bar")!.id = 2;
		b.byName("Bob")!.id = 3;

		const actual = patch(a.idMap, 1, 1);
		expect(actual).to.deep.equal([
			{
				name: "App",
				id: 1,
				start: 0,
				end: 150,
				children: [3, 2],
			},
			{ name: "Bar", id: 2, start: 80, end: 140, children: [] },
			{ name: "Bob", id: 3, start: 10, end: 60, children: [] },
		]);
	});

	it.only("should move siblings to the right #2", () => {
		const b = flames`
			App *************
			 Bar ****  Bob **
		`;

		b.byName("Bob")!.startTime -= 40;
		b.byName("Bob")!.endTime -= 40;

		const actual = patch(b.idMap, 1, 2);
		expect(actual).to.deep.equal([
			{
				name: "App",
				id: 1,
				start: 0,
				end: 170,
				children: [2, 3],
			},
			{
				name: "Bar",
				id: 2,
				start: 10,
				end: 90,
				children: [],
			},
			{ name: "Bob", id: 3, start: 110, end: 170, children: [] },
		]);
	});

	it("should enlarge parent", () => {
		const a = flames`
			App ****
			 Bar *****	
		`;

		const actual = patch(a.idMap, 1, 2);
		expect(actual).to.deep.equal([
			{ name: "App", id: 1, start: 0, end: 100, children: [2] },
			{ name: "Bar", id: 2, start: 10, end: 100, children: [] },
		]);
	});

	it("should support move static sub-tree", () => {
		const b = flames`
			App *****
			 Bar ***
			  Bob *
		`;

		b.nodes.forEach(node => {
			if (node.name !== "App") {
				node.startTime -= 100;
				node.endTime -= 100;
			}
		});

		const actual = patch(b.idMap, 1, 1);
		expect(actual).to.deep.equal([
			{ name: "App", id: 1, start: 0, end: 90, children: [2] },
			{ name: "Bar", id: 2, start: 0, end: 70, children: [3] },
			{ name: "Bob", id: 3, start: 10, end: 60, children: [] },
		]);
	});

	// describe.skip("fixtures", () => {
	// 	it("should patch fixture 1", () => {
	// 		const { previous, next, nextRoot, expected } = prepareFixture(patch1);
	// 		const res = patchTree(previous, next, nextRoot);
	// 		expect(toTimings(res)).to.deep.equal(expected);
	// 	});

	// 	it("should patch fixture 2", () => {
	// 		const { previous, next, nextRoot, expected } = prepareFixture(patch2);
	// 		const res = patchTree(previous, next, nextRoot);
	// 		expect(toTimings(res)).to.deep.equal(expected);
	// 	});

	// 	it("should mount new nodes fixture 3", () => {
	// 		const { previous, next, nextRoot, expected } = prepareFixture(patch3);
	// 		const res = patchTree(previous, next, nextRoot);
	// 		expect(toTimings(res)).to.deep.equal(expected);
	// 	});

	// 	it("should mount new nodes fixture 4", () => {
	// 		const { previous, next, nextRoot, expected } = prepareFixture(patch4);
	// 		const res = patchTree(previous, next, nextRoot);
	// 		expect(toTimings(res)).to.deep.equal(expected);
	// 	});

	// 	it("should mount new nodes fixture 5", () => {
	// 		const { previous, next, nextRoot, expected } = prepareFixture(patch5);
	// 		const res = patchTree(previous, next, nextRoot);
	// 		expect(toTimings(res)).to.deep.equal(expected);
	// 	});
	// });
});
