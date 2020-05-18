import { expect } from "chai";
import { patchTree, FlameTree } from "./patchTree";
import { flames } from "../testHelpers";
import { Tree, DevNode, ID } from "../../../../store/types";

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

describe("patchTree", () => {
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
			{ name: "App", id: 1, start: 0, end: 70, children: [2] },
			{ name: "Bar", id: 2, start: 0, end: 70, children: [3] },
			{ name: "Bob", id: 3, start: 10, end: 60, children: [] },
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
			// TODO: App is detected as a static tree
			{ name: "App", id: 1, start: 0, end: 90, children: [2] },
			{ name: "Bar", id: 2, start: 0, end: 70, children: [3] },
			{ name: "Bob", id: 3, start: 10, end: 60, children: [] },
		]);
	});

	it("should move siblings to the right", () => {
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
				start: 0,
				end: 80,
				children: [],
			},
			{ name: "Bob", id: 3, start: 80, end: 140, children: [] },
		]);
	});

	it("should enlarge parent", () => {
		const a = flames`
			App ****
			 Bar *****	
		`;

		const actual = patch(a.idMap, 1, 2);
		expect(actual).to.deep.equal([
			{ name: "App", id: 1, start: 0, end: 90, children: [2] },
			{ name: "Bar", id: 2, start: 0, end: 90, children: [] },
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
});
