import { expect } from "chai";
import { layoutRanked } from "./ranked";
import { flames } from "../testHelpers";
import { NodeTransform } from "../transform/focusNode";

const required: Partial<NodeTransform> = {
	visible: true,
	maximized: false,
};

describe("layoutRanked", () => {
	it("should order nodes by selfDuration", () => {
		const tree = flames`
        App **********
          Foo ****
            Bar *
      `;
		expect(
			layoutRanked(tree.nodes, tree.root, tree.root.selfDuration),
		).to.deep.equal([
			{ ...required, id: 1, width: 60, x: 0, row: 0, weight: 9 },
			{ ...required, id: 3, width: 50, x: 0, row: 1, weight: 8 },
			{ ...required, id: 2, width: 30, x: 0, row: 2, weight: 5 },
		]);
	});

	it("should order nodes by selfDuration #2", () => {
		const tree = flames`
        App ******************
          Foo ****  Baz **
            Bar *
      `;
		expect(
			layoutRanked(tree.nodes, tree.root, tree.root.selfDuration),
		).to.deep.equal([
			{ ...required, id: 1, width: 80, x: 0, row: 0, weight: 9 },
			{ ...required, id: 4, width: 60, x: 0, row: 1, weight: 7 },
			{ ...required, id: 3, width: 50, x: 0, row: 2, weight: 6 },
			{ ...required, id: 2, width: 30, x: 0, row: 3, weight: 3 },
		]);
	});

	it("should pad nodes with a width of 0", () => {
		const tree = flames`
        App ******************
          Foo ****  Baz **
            Bar *
      `;
		tree.nodes[3].endTime = 0;
		tree.nodes[3].selfDuration = 0;
		expect(
			layoutRanked(tree.nodes, tree.root, tree.root.selfDuration),
		).to.deep.equal([
			{ ...required, id: 1, width: 80, x: 0, row: 0, weight: 9 },
			{ ...required, id: 3, width: 50, x: 0, row: 1, weight: 6 },
			{ ...required, id: 2, width: 30, x: 0, row: 2, weight: 3 },
			{ ...required, id: 4, width: 0.01, x: 0, row: 3, weight: 0 },
		]);
	});
});
