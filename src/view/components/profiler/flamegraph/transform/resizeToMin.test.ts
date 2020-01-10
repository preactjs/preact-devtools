import { expect } from "chai";
import { flames } from "../testHelpers";
import { resizeToMin } from "./resizeToMin";

describe("resizeToMin", () => {
	it("should resize node to minimum size", () => {
		const tree = flames`
      App ********
        Foo ***
    `;

		const foo = tree.byName("Foo")!;
		foo.treeEndTime = foo.treeStartTime;
		resizeToMin(tree.idMap, 10);

		expect(foo.treeEndTime).to.equal(foo.treeStartTime + 10);
	});

	it("should resize overlapping node to minimum size", () => {
		const tree = flames`
      App **************
        Foo **  Bar **
    `;

		const foo = tree.byName("Foo")!;
		const bar = tree.byName("Bar")!;
		foo.treeEndTime = foo.treeStartTime;
		bar.treeStartTime = foo.treeStartTime;
		bar.treeEndTime = foo.treeStartTime;

		resizeToMin(tree.idMap, 10);

		expect(foo.treeEndTime).to.equal(foo.treeStartTime + 10);

		expect(bar.treeStartTime).to.equal(foo.treeEndTime);
		expect(bar.treeEndTime).to.equal(foo.treeEndTime + 10);
	});

	it("should resize parent if necessary to minimum size", () => {
		const tree = flames`
      App *****
        Foo ***
    `;

		const app = tree.byName("App")!;
		const foo = tree.byName("Foo")!;
		foo.treeEndTime = foo.treeStartTime;
		app.treeEndTime = foo.treeEndTime;
		resizeToMin(tree.idMap, 10);

		expect(app.treeEndTime).to.equal(foo.treeEndTime);
	});

	it("should resize multiple parents parent if necessary", () => {
		const tree = flames`
      App *****
       App2 ***
        Foo ***
    `;

		const app = tree.byName("App")!;
		const app2 = tree.byName("App2")!;
		const foo = tree.byName("Foo")!;

		foo.treeEndTime = foo.treeStartTime;
		app.treeEndTime = foo.treeEndTime;
		app2.treeEndTime = foo.treeEndTime;

		resizeToMin(tree.idMap, 10);

		expect(app.treeEndTime).to.equal(foo.treeEndTime);
		expect(app2.treeEndTime).to.equal(foo.treeEndTime);
	});
});
