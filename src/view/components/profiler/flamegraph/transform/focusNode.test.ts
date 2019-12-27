import { expect } from "chai";
import { focusNode, NodeTransform } from "./focusNode";

describe("FlameGraph", () => {
	describe("focusNode", () => {
		it("should focus flat tree", () => {
			const nodes: NodeTransform[] = [
				{ id: 1, row: 0, width: 100, x: 0 },
				{ id: 2, row: 1, width: 50, x: 25 },
				{ id: 3, row: 2, width: 25, x: 40 },
			];

			expect(focusNode(nodes, 2)).to.deep.equal([
				{ id: 1, row: 0, width: 100, x: 0 },
				{ id: 2, row: 1, width: 100, x: 0 },
				{ id: 3, row: 2, width: 50, x: 30 },
			]);
		});

		it("should focus sibling tree", () => {
			const nodes: NodeTransform[] = [
				{ id: 1, row: 0, width: 100, x: 0 },
				{ id: 2, row: 1, width: 50, x: 25 },
				{ id: 3, row: 2, width: 25, x: 40 },
				{ id: 4, row: 1, width: 25, x: 75 },
			];

			expect(focusNode(nodes, 2)).to.deep.equal([
				{ id: 1, row: 0, width: 100, x: 0 },
				{ id: 2, row: 1, width: 100, x: 0 },
				{ id: 4, row: 1, width: 50, x: 100 },
				{ id: 3, row: 2, width: 50, x: 30 },
			]);
		});
	});
});
