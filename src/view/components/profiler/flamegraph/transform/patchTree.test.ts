import { expect } from "chai";
import { flames, byName } from "../testHelpers";
import { patchTree } from "./patchTree";

describe.only("patchTree", () => {
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

		console.log(Array.from(merged.values()));

		expect(app.startTime < bar.startTime).to.equal(true);
		expect(app.endTime > bar.endTime).to.equal(true);

		expect(app.startTime < bob.startTime).to.equal(true);
		expect(app.endTime > bob.endTime).to.equal(true);

		expect(bar.startTime < bob.startTime).to.equal(true);
		expect(bar.endTime < bob.endTime).to.equal(true);

		console.log(b.nodes);
	});

	it("should mount node", () => {
		const tree = new Map([
			[
				1,
				{
					children: [2, 3],
					depth: 1,
					id: 1,
					name: "Fragment",
					parent: 1,
					type: 3,
					key: "",
					startTime: 385,
					endTime: 392,
					treeStartTime: 385,
					treeEndTime: 392,
				},
			],
			[
				2,
				{
					children: [],
					depth: 2,
					id: 2,
					name: "Prime",
					parent: 1,
					type: 3,
					key: "",
					startTime: 386,
					endTime: 390,
					treeStartTime: 386,
					treeEndTime: 390,
				},
			],
			[
				3,
				{
					children: [4, 5],
					depth: 2,
					id: 3,
					name: "TodoList",
					parent: 1,
					type: 3,
					key: "",
					startTime: 3236,
					endTime: 3238,
					treeStartTime: 390,
					treeEndTime: 391,
				},
			],
			[
				4,
				{
					children: [],
					depth: 3,
					id: 4,
					name: "TodoItem",
					parent: 3,
					type: 3,
					key: "asd",
					startTime: 390,
					endTime: 391,
					treeStartTime: 390,
					treeEndTime: 391,
				},
			],
			[
				5,
				{
					children: [],
					depth: 3,
					id: 5,
					name: "TodoItem",
					parent: 3,
					type: 3,
					key: "asdf",
					startTime: 391,
					endTime: 391,
					treeStartTime: 391,
					treeEndTime: 391,
				},
			],
		]);

		const oldRoot = {
			children: [4, 5],
			depth: 2,
			id: 3,
			name: "TodoList",
			parent: 1,
			type: 3,
			key: "",
			startTime: 2526,
			endTime: 2526,
			treeStartTime: 355,
			treeEndTime: 357,
		};
	});
});
