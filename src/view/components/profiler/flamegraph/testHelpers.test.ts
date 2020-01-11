import { expect } from "chai";
import { flames } from "./testHelpers";
import { ProfilerNode } from "../data/commits";
import { DevNodeType } from "../../../store/types";

describe("FlameGraph DSL", () => {
	it("should convert flat flamegraph", () => {
		const tree = flames`
      App *********
       Foo ******
         Bar ***
    `;

		const expected: ProfilerNode[] = [
			{
				id: 1,
				name: "App",
				key: "",
				type: DevNodeType.FunctionComponent,
				startTime: 0,
				endTime: 130,
				treeStartTime: 0,
				treeEndTime: 130,
				duration: 130,
				children: [2],
				parent: 0,
				depth: 0,
				selfDuration: 30,
			},
			{
				id: 2,
				name: "Foo",
				key: "",
				type: DevNodeType.FunctionComponent,
				startTime: 10,
				endTime: 110,
				treeStartTime: 10,
				treeEndTime: 110,
				duration: 100,
				selfDuration: 30,
				children: [3],
				parent: 1,
				depth: 1,
			},
			{
				id: 3,
				name: "Bar",
				key: "",
				type: DevNodeType.FunctionComponent,
				startTime: 30,
				endTime: 100,
				treeStartTime: 30,
				treeEndTime: 100,
				duration: 70,
				selfDuration: 70,
				depth: 2,
				children: [],
				parent: 2,
			},
		];

		expect(tree.nodes).to.deep.equal(expected);
	});

	it("should detect flat children", () => {
		const tree = flames`
      App *********
      Foo ******
      Bar ***
    `;

		const expected: ProfilerNode[] = [
			{
				id: 1,
				name: "App",
				key: "",
				type: DevNodeType.FunctionComponent,
				startTime: 0,
				endTime: 130,
				treeStartTime: 0,
				treeEndTime: 130,
				duration: 130,
				children: [2],
				parent: 0,
				depth: 0,
				selfDuration: 30,
			},
			{
				id: 2,
				name: "Foo",
				key: "",
				type: DevNodeType.FunctionComponent,
				startTime: 0,
				endTime: 100,
				treeStartTime: 0,
				treeEndTime: 100,
				duration: 100,
				selfDuration: 30,
				children: [3],
				parent: 1,
				depth: 1,
			},
			{
				id: 3,
				name: "Bar",
				key: "",
				type: DevNodeType.FunctionComponent,
				startTime: 0,
				endTime: 70,
				treeStartTime: 0,
				treeEndTime: 70,
				duration: 70,
				selfDuration: 70,
				parent: 2,
				depth: 2,
				children: [],
			},
		];

		expect(tree.nodes).to.deep.equal(expected);
	});

	it("should throw if names are not unique", () => {
		expect(
			() => flames`
      App ***
      App ***
    `,
		).to.throw();
	});

	it("should access nodes by name", () => {
		const tree = flames`
      App *********
      Foo ******
      Bar ***
    `;

		expect(tree.byName("App")).to.not.be.undefined;
		expect(tree.byName("Foo")).to.not.be.undefined;
		expect(tree.byName("Bar")).to.not.be.undefined;
	});

	it("should throw if child duration is longer than parent duration", () => {
		expect(
			() => flames`
      Parent ***
      Child ******
    `,
		).to.throw();
	});

	it("should support simple sibling children", () => {
		const tree = flames`
    App ******************
     Foo ******  Bar ***
  `;

		const expected: ProfilerNode[] = [
			{
				id: 1,
				name: "App",
				key: "",
				type: DevNodeType.FunctionComponent,
				startTime: 0,
				endTime: 220,
				treeStartTime: 0,
				treeEndTime: 220,
				duration: 220,
				selfDuration: 50,
				children: [2, 3],
				parent: 0,
				depth: 0,
			},
			{
				id: 2,
				name: "Foo",
				key: "",
				type: DevNodeType.FunctionComponent,
				startTime: 10,
				endTime: 110,
				treeStartTime: 10,
				treeEndTime: 110,
				duration: 100,
				selfDuration: 100,
				children: [],
				parent: 1,
				depth: 1,
			},
			{
				id: 3,
				name: "Bar",
				key: "",
				type: DevNodeType.FunctionComponent,
				startTime: 130,
				endTime: 200,
				treeStartTime: 130,
				treeEndTime: 200,
				duration: 70,
				selfDuration: 70,
				depth: 1,
				children: [],
				parent: 1,
			},
		];

		expect(tree.nodes).to.deep.equal(expected);
	});

	it("should not mix unrelated children", () => {
		const tree = flames`
    App ******************
     Foo ******  Baz ***
       Bar ***    Bob **
	`;

		const expected: ProfilerNode[] = [
			{
				id: 1,
				name: "App",
				key: "",
				type: DevNodeType.FunctionComponent,
				startTime: 0,
				endTime: 220,
				treeStartTime: 0,
				treeEndTime: 220,
				duration: 220,
				selfDuration: 50,
				children: [2, 4],
				depth: 0,
				parent: 0,
			},
			{
				id: 2,
				name: "Foo",
				key: "",
				type: DevNodeType.FunctionComponent,
				startTime: 10,
				endTime: 110,
				treeStartTime: 10,
				treeEndTime: 110,
				duration: 100,
				selfDuration: 30,
				children: [3],
				parent: 1,
				depth: 1,
			},
			{
				id: 3,
				name: "Bar",
				key: "",
				type: DevNodeType.FunctionComponent,
				startTime: 30,
				endTime: 100,
				treeStartTime: 30,
				treeEndTime: 100,
				duration: 70,
				selfDuration: 70,
				depth: 2,
				children: [],
				parent: 2,
			},
			{
				id: 4,
				name: "Baz",
				key: "",
				type: DevNodeType.FunctionComponent,
				startTime: 130,
				endTime: 200,
				treeStartTime: 130,
				treeEndTime: 200,
				duration: 70,
				selfDuration: 10,
				depth: 1,
				children: [5],
				parent: 1,
			},
			{
				id: 5,
				name: "Bob",
				key: "",
				type: DevNodeType.FunctionComponent,
				startTime: 140,
				endTime: 200,
				treeStartTime: 140,
				treeEndTime: 200,
				duration: 60,
				selfDuration: 60,
				depth: 2,
				children: [],
				parent: 4,
			},
		];

		expect(tree.nodes).to.deep.equal(expected);
	});

	it("should create a commit", () => {
		const tree = flames`
			App *******
			  Bar **
		`;

		expect(tree.commit).to.deep.equal({
			commitRootId: 1,
			rootId: 1,
			duration: 110,
			maxDepth: 1,
			maxSelfDuration: 60,
			nodes: tree.idMap,
		});
	});
});
