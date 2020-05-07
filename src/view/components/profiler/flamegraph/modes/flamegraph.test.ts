import { expect } from "chai";
import { flames } from "../testHelpers";
import { layoutTimeline } from "./flamegraph";

const required = {
	visible: true,
	maximized: false,
};

describe("layoutTimeline", () => {
	it("should display simple flamegraph", () => {
		const tree = flames`
        App **********
          Foo ****
            Bar *
      `;
		expect(
			layoutTimeline(tree.nodes, tree.root, tree.root, tree.root.selfDuration),
		).to.deep.equal([
			{ ...required, id: 1, width: 140, x: 0, row: 0, weight: 9 },
			{ ...required, id: 2, width: 80, x: 20, row: 1, weight: 5 },
			{ ...required, id: 3, width: 50, x: 40, row: 2, weight: 8 },
		]);
	});

	it("should display simple complex flamegraph", () => {
		const tree = flames`
        App *********************
          Foo ****   Baz ******
            Bar *      Bob **
      `;
		expect(
			layoutTimeline(tree.nodes, tree.root, tree.root, tree.root.selfDuration),
		).to.deep.equal([
			{ ...required, id: 1, width: 250, x: 0, row: 0, weight: 9 },
			{ ...required, id: 2, width: 80, x: 20, row: 1, weight: 4 },
			{ ...required, id: 3, width: 50, x: 40, row: 2, weight: 6 },
			{ ...required, id: 4, width: 100, x: 130, row: 1, weight: 5 },
			{ ...required, id: 5, width: 60, x: 150, row: 2, weight: 8 },
		]);
	});
});
