import { expect } from "chai";
import { flattenChildren } from "./windowing";
import { ID } from "../../store/types";

describe("flattenChildren", () => {
	let tree = new Map<ID, { id: ID; children: ID[]; depth: number }>();
	tree.set(1, { id: 1, children: [2, 3, 6], depth: 1 });
	tree.set(2, { id: 2, children: [4], depth: 2 });
	tree.set(3, { id: 3, children: [5], depth: 2 });
	tree.set(4, { id: 4, children: [], depth: 3 });
	tree.set(5, { id: 5, children: [], depth: 3 });
	tree.set(6, { id: 6, children: [], depth: 2 });

	it("should flatten tree", () => {
		let collapsed = new Set<ID>();
		expect(flattenChildren(tree, 1, collapsed).items).to.deep.equal([
			1,
			2,
			4,
			3,
			5,
			6,
		]);
	});

	it("should return maxDepth", () => {
		expect(flattenChildren(tree, 1, new Set<ID>()).maxDepth).to.equal(3);
	});
});
