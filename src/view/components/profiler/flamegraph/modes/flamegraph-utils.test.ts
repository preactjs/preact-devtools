import { expect } from "chai";
import { flames } from "../testHelpers";
import { toTransform } from "./flamegraph-utils";

const required = {
	visible: true,
	maximized: false,
	commitParent: false,
};

describe("toTransform", () => {
	it("should display simple flamegraph", () => {
		const tree = flames`
        App **********
          Foo ****
            Bar *
      `;
		expect(Array.from(toTransform(tree.commit).values())).to.deep.equal([
			{ ...required, id: 1, width: 60, x: 0, row: 0, weight: 9 },
			{ ...required, id: 2, width: 30, x: 0, row: 1, weight: 5 },
			{ ...required, id: 3, width: 50, x: 0, row: 2, weight: 8 },
		]);
	});

	it("should display simple complex flamegraph", () => {
		const tree = flames`
        App *********************
          Foo ****   Baz ******
            Bar *      Bob **
      `;
		expect(Array.from(toTransform(tree.commit).values())).to.deep.equal([
			{ ...required, id: 1, width: 70, x: 0, row: 0, weight: 9 },
			{ ...required, id: 2, width: 30, x: 0, row: 1, weight: 4 },
			{ ...required, id: 3, width: 50, x: 0, row: 2, weight: 6 },
			{ ...required, id: 4, width: 40, x: 0, row: 1, weight: 5 },
			{ ...required, id: 5, width: 60, x: 0, row: 2, weight: 8 },
		]);
	});
});
