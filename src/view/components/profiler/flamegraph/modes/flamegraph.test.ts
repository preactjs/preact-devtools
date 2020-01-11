import { expect } from "chai";
import { flames } from "../testHelpers";
import { layoutTimeline } from "./flamegraph";

describe("FlameGraph", () => {
	describe("layoutTimeline", () => {
		it("should display simple flamegraph", () => {
			const tree = flames`
        App **********
          Foo ****
            Bar *
      `;
			expect(layoutTimeline(tree.nodes)).to.deep.equal([
				{ id: 1, width: 140, x: 0, row: 0 },
				{ id: 2, width: 80, x: 20, row: 1 },
				{ id: 3, width: 50, x: 40, row: 2 },
			]);
		});

		it("should display simple complex flamegraph", () => {
			const tree = flames`
        App *********************
          Foo ****   Baz ******
            Bar *      Bob **
      `;
			expect(layoutTimeline(tree.nodes)).to.deep.equal([
				{ id: 1, width: 250, x: 0, row: 0 },
				{ id: 2, width: 80, x: 20, row: 1 },
				{ id: 3, width: 50, x: 40, row: 2 },
				{ id: 4, width: 100, x: 130, row: 1 },
				{ id: 5, width: 60, x: 150, row: 2 },
			]);
		});
	});
});
