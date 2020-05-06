import { flames } from "../testHelpers";
import { expect } from "chai";
import { mapParents, adjustNodesToRight } from "./util";
import { DevNode } from "../../../../store/types";

describe("mapParents", () => {
	it("should do nothing if root", () => {
		const tree = flames`
    App *****************
      Foo **   Bar ******
                Bob ***
    `;

		const res: string[] = [];
		mapParents(tree.idMap, tree.byName("App")!.id, p => {
			res.push(p.name);
		});
		expect(res).to.deep.equal([]);
	});

	it("should traverse parents", () => {
		const tree = flames`
    App *****************
      Foo **   Bar ******
                Bob ***
    `;

		const res: string[] = [];
		mapParents(tree.idMap, tree.byName("Bob")!.id, p => {
			res.push(p.name);
		});
		expect(res).to.deep.equal(["Bar", "App"]);
	});

	it("should traverse parents", () => {
		const tree = flames`
    App *****************
      Foo **   Bar ******
                Bob ***
    `;

		const res: string[] = [];
		mapParents(tree.idMap, tree.byName("Foo")!.id, p => {
			res.push(p.name);
		});
		expect(res).to.deep.equal(["App"]);
	});

	it("should pass correct prevParents", () => {
		const tree = flames`
    App *****************
      Foo **   Bar ******
                Bob ***
    `;

		const res: string[] = [];
		mapParents(tree.idMap, tree.byName("Foo")!.id, (p, pp) => {
			res.push(pp.name + "->" + p.name);
		});
		expect(res).to.deep.equal(["Foo->App"]);
	});

	it("should pass correct prevParents #2", () => {
		const tree = flames`
    App *****************
      Foo **   Bar ******
                Bob ***
    `;

		const res: string[] = [];
		mapParents(tree.idMap, tree.byName("Bob")!.id, (p, pp) => {
			res.push(pp.name + "->" + p.name);
		});
		expect(res).to.deep.equal(["Bob->Bar", "Bar->App"]);
	});
});

function toTimings(node: DevNode) {
	return {
		name: node.name,
		treeStartTime: node.treeStartTime,
		treeEndTime: node.treeEndTime,
	};
}

describe("adjustNodesToRight", () => {
	it("should traverse parents", () => {
		const tree = flames`
    App *****************
      Foo **   Bar ******
                Bob ***
    `;

		expect(tree.nodes.map(toTimings)).to.deep.equal([
			{ name: "App", treeStartTime: 0, treeEndTime: 210 },
			{ name: "Foo", treeStartTime: 20, treeEndTime: 80 },
			{ name: "Bar", treeStartTime: 110, treeEndTime: 210 },
			{ name: "Bob", treeStartTime: 120, treeEndTime: 190 },
		]);
		adjustNodesToRight(tree.idMap, tree.byName("Bob")!.id, 10);
		expect(tree.nodes.map(toTimings)).to.deep.equal([
			{ name: "App", treeStartTime: 0, treeEndTime: 220 },
			{ name: "Foo", treeStartTime: 20, treeEndTime: 80 },
			{ name: "Bar", treeStartTime: 110, treeEndTime: 220 },
			{ name: "Bob", treeStartTime: 120, treeEndTime: 190 },
		]);
	});

	it("should map to right", () => {
		const tree = flames`
    App *****************
      Foo **   Bar ******
       Faz *    Bob ***
    `;

		expect(tree.nodes.map(toTimings)).to.deep.equal([
			{ name: "App", treeStartTime: 0, treeEndTime: 210 },
			{ name: "Foo", treeStartTime: 20, treeEndTime: 80 },
			{ name: "Faz", treeStartTime: 30, treeEndTime: 80 },
			{ name: "Bar", treeStartTime: 110, treeEndTime: 210 },
			{ name: "Bob", treeStartTime: 120, treeEndTime: 190 },
		]);
		adjustNodesToRight(tree.idMap, tree.byName("Faz")!.id, 10);
		expect(tree.nodes.map(toTimings)).to.deep.equal([
			{ name: "App", treeStartTime: 0, treeEndTime: 220 },
			{ name: "Foo", treeStartTime: 20, treeEndTime: 90 },
			{ name: "Faz", treeStartTime: 30, treeEndTime: 80 },
			{ name: "Bar", treeStartTime: 120, treeEndTime: 220 },
			{ name: "Bob", treeStartTime: 130, treeEndTime: 200 },
		]);
	});
});
