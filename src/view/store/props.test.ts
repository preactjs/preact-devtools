import { expect } from "vitest";
import { parseObjectState } from "./props";

describe("parseObjectState", () => {
	it("only materializes children for expanded prop paths", () => {
		const data = {
			childrenById: [[1], [2], [3]],
			id: 0,
		};

		let items = parseObjectState(data, []);
		expect(items.map(item => item.id)).to.deep.equal([
			"root.childrenById",
			"root.id",
		]);

		items = parseObjectState(data, ["root.childrenById"]);
		expect(items.map(item => item.id)).to.deep.equal([
			"root.childrenById",
			"root.childrenById.0",
			"root.childrenById.1",
			"root.childrenById.2",
			"root.id",
		]);
	});
});
