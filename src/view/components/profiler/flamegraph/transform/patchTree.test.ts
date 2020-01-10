import { expect } from "chai";
import { flames, byName } from "../testHelpers";
import { patchTree } from "./patchTree";

describe("patchTree", () => {
	it("should return old tree when new one is empty", () => {
		const old = new Map();
		const res = patchTree(old, new Map(), 1);
		expect(res).to.equal(old);
	});

	it("should offset timings if tree is new", () => {
		const state = flames`
			App *******
				Bar **
		`;

		state.nodes.forEach(x => {
			x.startTime += 200;
			x.endTime += 200;
		});

		const res = patchTree(new Map(), state.idMap, 1);
		expect(res.get(1)!.treeStartTime).to.equal(0);
		expect(res.get(1)!.treeEndTime < 200).to.equal(true);

		expect(res.get(2)!.treeStartTime < 200).to.equal(true);
		expect(res.get(2)!.treeEndTime < 200).to.equal(true);
	});

	it("should merge trees at root", () => {
		const a = flames`
			App ******
		`;

		const b = flames`
			App *****
			 Bar ***
		`;

		const merged = patchTree(a.idMap, b.idMap, 1);

		const app = merged.get(1)!;
		const bar = merged.get(2)!;

		expect(app.children).to.deep.equal([2]);
		expect(app.startTime < bar.startTime).to.equal(true);
		expect(app.endTime > bar.endTime).to.equal(true);
	});

	it("should merge sub-trees", () => {
		const a = flames`
			App ******
			  Bar **
		`;

		const b = flames`
			App *****
			 Bar ***
			 	Bob *
		`;

		const merged = patchTree(a.idMap, b.idMap, 1);

		const bar = merged.get(2)!;
		const bob = merged.get(3)!;

		expect(bar.children).to.deep.equal([3]);
		expect(bar.startTime < bob.startTime).to.equal(true);
		expect(bar.endTime > bob.endTime).to.equal(true);
	});

	it("should merge positive offset tree", () => {
		const a = flames`
			App ******
		`;

		const b = flames`
			App *****
			 Bar ***
			  Bob *
		`;

		b.nodes.forEach(x => {
			x.startTime += 100;
			x.endTime += 100;
		});

		patchTree(a.idMap, b.idMap, 1);

		const app = b.byName("App")!;
		const bar = b.byName("Bar")!;
		const bob = b.byName("Bob")!;
		expect(app.startTime < bar.startTime).to.equal(true);
		expect(app.endTime > bar.endTime).to.equal(true);
		expect(bar.startTime < bob.startTime).to.equal(true);
		expect(bar.endTime > bob.endTime).to.equal(true);
	});

	it("should expand parent", () => {
		const a = flames`
			App ******
		`;

		const b = flames`
			App ***********
			 Bar ********
		`;

		patchTree(a.idMap, b.idMap, 1);

		const app = b.byName("App")!;
		const bar = b.byName("Bar")!;
		expect(app.startTime < bar.startTime).to.equal(true);
		expect(app.endTime > bar.endTime).to.equal(true);
	});

	it("should move siblings to the right", () => {
		const a = flames`
		App ***********
		  Bar **
	`;

		const b = flames`
		App ***********
		 Bob *  Bar **
	`;

		b.byName("App")!.children = [3, 2];
		b.byName("Bar")!.id = 2;
		b.byName("Bob")!.id = 3;

		const merged = patchTree(a.idMap, b.idMap, 1);

		const app = byName(merged, "App")!;
		const bar = byName(merged, "Bar")!;
		const bob = byName(merged, "Bob")!;

		expect(app.startTime < bar.startTime).to.equal(true);
		expect(app.endTime > bar.endTime).to.equal(true);

		expect(app.startTime < bob.startTime).to.equal(true);
		expect(app.endTime > bob.endTime).to.equal(true);

		expect(bar.startTime < bob.startTime).to.equal(true);
		expect(bar.endTime < bob.endTime).to.equal(true);
	});
});
