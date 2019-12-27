import { expect } from "chai";
import { layoutRanked } from "./ranked";
import { flames } from "../testHelpers";

describe("FlameGraph", () => {
	describe("layoutRanked", () => {
		it("should order nodes by selfDuration", () => {
			const tree = flames`
        App **********
          Foo ****
            Bar *
      `;
			expect(layoutRanked(tree.nodes)).to.deep.equal([
				{ id: 1, width: 60, x: 0, row: 0 },
				{ id: 3, width: 50, x: 0, row: 1 },
				{ id: 2, width: 30, x: 0, row: 2 },
			]);
		});

		it("should order nodes by selfDuration #2", () => {
			const tree = flames`
        App ******************
          Foo ****  Baz **
            Bar *
      `;
			expect(layoutRanked(tree.nodes)).to.deep.equal([
				{ id: 1, width: 80, x: 0, row: 0 },
				{ id: 4, width: 60, x: 0, row: 1 },
				{ id: 3, width: 50, x: 0, row: 2 },
				{ id: 2, width: 30, x: 0, row: 3 },
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
			expect(layoutRanked(tree.nodes)).to.deep.equal([
				{ id: 1, width: 80, x: 0, row: 0 },
				{ id: 3, width: 50, x: 0, row: 1 },
				{ id: 2, width: 30, x: 0, row: 2 },
				{ id: 4, width: 0.01, x: 0, row: 3 },
			]);
		});
	});
});
