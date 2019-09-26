import { expect } from "chai";
import { ID } from "../../store";
import { getRelativeId, filterCollapsed, flattenChildren } from "./windowing";

describe("flattenChildren", () => {
	it("should flatten tree", () => {
		let tree = new Map<ID, { id: ID; children: ID[] }>();
		tree.set(1, { id: 1, children: [2, 3] });
		tree.set(2, { id: 2, children: [4] });
		tree.set(3, { id: 3, children: [5] });
		tree.set(4, { id: 4, children: [] });
		tree.set(5, { id: 5, children: [] });
		expect(flattenChildren(tree, 1)).to.deep.equal([2, 4, 3, 5]);
	});
});

describe("getRelativeId", () => {
	it("should get the next id", () => {
		expect(getRelativeId([1, 2, 3], 1, 1)).to.equal(2);
		expect(getRelativeId([1, 2, 3], 2, -1)).to.equal(1);
		expect(getRelativeId([1, 2, 3], 2, 0)).to.equal(2);
	});

	it("should clamp selected in range", () => {
		expect(getRelativeId([1, 2, 3], 3, 1)).to.equal(3);
		expect(getRelativeId([1, 2, 3], 1, -1)).to.equal(1);
	});
});

describe("filterCollapsed", () => {
	it("should filter collapsed nodes", () => {
		let tree = new Map([
			[1, { depth: 1 }],
			[2, { depth: 2 }],
			[3, { depth: 3 }],
		]);
		expect(filterCollapsed(tree, [1, 2, 3], new Set([2]))).to.deep.equal([
			1,
			2,
		]);
	});
});
