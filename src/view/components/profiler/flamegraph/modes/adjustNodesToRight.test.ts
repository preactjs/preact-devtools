import { flames } from "../testHelpers";
import { expect } from "chai";
import { adjustNodesToRight } from "./adjustNodesToRight";

function toTimings(res: ReturnType<typeof flames>) {
	return Array.from(res.idMap.values()).map(node => {
		const t = res.transformMap.get(node.id)!;
		return {
			name: node.name,
			start: t.start,
			end: t.end,
		};
	});
}

describe("adjustNodesToRight", () => {
	it("should traverse parents", () => {
		const tree = flames`
    App *****************
      Foo **   Bar ******
                Bob ***
    `;

		expect(toTimings(tree)).to.deep.equal([
			{ name: "App", start: 0, end: 210 },
			{ name: "Foo", start: 20, end: 80 },
			{ name: "Bar", start: 110, end: 210 },
			{ name: "Bob", start: 120, end: 190 },
		]);
		adjustNodesToRight(
			tree.idMap,
			tree.transformMap,
			tree.byName("Bob")!.id,
			10,
			-1,
			new Set(),
		);
		expect(toTimings(tree)).to.deep.equal([
			{ name: "App", start: 0, end: 220 },
			{ name: "Foo", start: 20, end: 80 },
			{ name: "Bar", start: 110, end: 220 },
			{ name: "Bob", start: 120, end: 190 },
		]);
	});

	it("should map to right", () => {
		const tree = flames`
    App *****************
      Foo **   Bar ******
       Faz *    Bob ***
    `;

		expect(toTimings(tree)).to.deep.equal([
			{ name: "App", start: 0, end: 210 },
			{ name: "Foo", start: 20, end: 80 },
			{ name: "Faz", start: 30, end: 80 },
			{ name: "Bar", start: 110, end: 210 },
			{ name: "Bob", start: 120, end: 190 },
		]);
		adjustNodesToRight(
			tree.idMap,
			tree.transformMap,
			tree.byName("Faz")!.id,
			10,
			-1,
			new Set(),
		);
		expect(toTimings(tree)).to.deep.equal([
			{ name: "App", start: 0, end: 220 },
			{ name: "Foo", start: 20, end: 90 },
			{ name: "Faz", start: 30, end: 80 },
			{ name: "Bar", start: 120, end: 220 },
			{ name: "Bob", start: 130, end: 200 },
		]);
	});
});
