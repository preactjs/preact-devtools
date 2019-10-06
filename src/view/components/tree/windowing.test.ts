import { expect } from "chai";
import { flattenChildren } from "./windowing";
import { ID } from "../../store/types";

describe("flattenChildren", () => {
	it("should flatten tree", () => {
		let collapsed = new Set<ID>();
		let tree = new Map<ID, { id: ID; children: ID[] }>();
		tree.set(1, { id: 1, children: [2, 3, 6] });
		tree.set(2, { id: 2, children: [4] });
		tree.set(3, { id: 3, children: [5] });
		tree.set(4, { id: 4, children: [] });
		tree.set(5, { id: 5, children: [] });
		tree.set(6, { id: 6, children: [] });
		expect(flattenChildren(tree, 1, collapsed)).to.deep.equal([
			1,
			2,
			4,
			3,
			5,
			6,
		]);
	});
});
