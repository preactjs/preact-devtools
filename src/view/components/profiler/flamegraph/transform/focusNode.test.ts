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

		it("should focus flat tree #2", () => {
			const nodes: NodeTransform[] = [
				{ id: 1, row: 0, width: 100, x: 0 },
				{ id: 2, row: 1, width: 75, x: 25 },
				{ id: 3, row: 2, width: 60, x: 40 },
			];

			expect(focusNode(nodes, 2)).to.deep.equal([
				{ id: 1, row: 0, width: 100, x: 0 },
				{ id: 2, row: 1, width: 100, x: 0 },
				{ id: 3, row: 2, width: 80, x: 20 },
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

		it("should focus tree", () => {
			const nodes: NodeTransform[] = [
				{
					id: 1,
					x: 0,
					row: 0,
					width: 5.02,
				},
				{
					id: 2,
					x: 1,
					row: 1,
					width: 2,
				},
				{
					id: 3,
					x: 3,
					row: 1,
					width: 2.0199999999999996,
				},
				{
					id: 4,
					x: 5,
					row: 2,
					width: 0.009999999999999787,
				},
				{
					id: 5,
					x: 5.01,
					row: 2,
					width: 0.009999999999999787,
				},
			];

			expect(focusNode(nodes, 2)).to.deep.equal([
				{ id: 1, row: 0, width: 5.02, x: 0 },
				{ id: 2, row: 1, width: 5.02, x: 0 },
				{ id: 3, row: 1, width: 5.070199999999999, x: 5.02 },
				{ id: 4, row: 2, width: 0.025099999999999463, x: 10.04 },
				{ id: 5, row: 2, width: 0.025099999999999463, x: 10.0651 },
			]);
		});
	});
});
