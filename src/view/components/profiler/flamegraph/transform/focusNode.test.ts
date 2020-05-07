import { expect } from "chai";
import { focusNode, NodeTransform } from "./focusNode";

const required = {
	weight: -1,
	maximized: true,
	visible: true,
};

describe("focusNode", () => {
	it("should focus flat tree", () => {
		const nodes: NodeTransform[] = [
			{ ...required, id: 1, row: 0, width: 100, x: 0 },
			{ ...required, id: 2, row: 1, width: 50, x: 25 },
			{ ...required, id: 3, row: 2, width: 25, x: 40 },
		];

		expect(focusNode(nodes, 2)).to.deep.equal([
			{ ...required, id: 1, row: 0, width: 100, x: 0, maximized: true },
			{ ...required, id: 2, row: 1, width: 100, x: 0, maximized: true },
			{ ...required, id: 3, row: 2, width: 50, x: 30, maximized: false },
		]);
	});

	it("should focus flat tree #2", () => {
		const nodes: NodeTransform[] = [
			{ ...required, id: 1, row: 0, width: 100, x: 0 },
			{ ...required, id: 2, row: 1, width: 75, x: 25 },
			{ ...required, id: 3, row: 2, width: 60, x: 40 },
		];

		expect(focusNode(nodes, 2)).to.deep.equal([
			{ ...required, id: 1, row: 0, width: 100, x: 0, maximized: true },
			{ ...required, id: 2, row: 1, width: 100, x: 0, maximized: true },
			{ ...required, id: 3, row: 2, width: 80, x: 20, maximized: false },
		]);
	});

	it("should focus sibling tree", () => {
		const nodes: NodeTransform[] = [
			{ ...required, id: 1, row: 0, width: 100, x: 0 },
			{ ...required, id: 2, row: 1, width: 50, x: 25 },
			{ ...required, id: 3, row: 2, width: 25, x: 40 },
			{ ...required, id: 4, row: 1, width: 25, x: 75 },
		];

		expect(focusNode(nodes, 2)).to.deep.equal([
			{ ...required, id: 1, row: 0, width: 100, x: 0, maximized: true },
			{ ...required, id: 2, row: 1, width: 100, x: 0, maximized: true },
			{ ...required, id: 4, row: 1, width: 50, x: 100, maximized: false },
			{ ...required, id: 3, row: 2, width: 50, x: 30, maximized: false },
		]);
	});

	it("should focus tree", () => {
		const nodes: NodeTransform[] = [
			{
				...required,
				id: 1,
				x: 0,
				row: 0,
				width: 5.02,
			},
			{
				...required,
				id: 2,
				x: 1,
				row: 1,
				width: 2,
			},
			{
				...required,
				id: 3,
				x: 3,
				row: 1,
				width: 2.0199999999999996,
			},
			{
				...required,
				id: 4,
				x: 5,
				row: 2,
				width: 0.009999999999999787,
			},
			{
				...required,
				id: 5,
				x: 5.01,
				row: 2,
				width: 0.009999999999999787,
			},
		];

		expect(focusNode(nodes, 2)).to.deep.equal([
			{ ...required, id: 1, row: 0, width: 5.02, x: 0, maximized: true },
			{ ...required, id: 2, row: 1, width: 5.02, x: 0, maximized: true },
			{
				...required,
				id: 3,
				row: 1,
				width: 5.070199999999999,
				x: 5.02,
				maximized: false,
			},
			{
				...required,
				id: 4,
				row: 2,
				width: 0.025099999999999463,
				x: 10.04,
				maximized: false,
			},
			{
				...required,
				id: 5,
				row: 2,
				width: 0.025099999999999463,
				x: 10.0651,
				maximized: false,
			},
		]);
	});
});
