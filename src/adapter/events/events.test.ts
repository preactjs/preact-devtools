import { expect } from "chai";
import { applyEvent } from "./events";
import * as sinon from "sinon";
import { createStore } from "../../view/store";
import { fromSnapshot } from "../debug";

describe("applyEvent", () => {
	it("should add roots", () => {
		const store = createStore();
		const data = fromSnapshot(["rootId: 1"]);
		applyEvent(store, "operation_v2", data);
		expect(store.roots.$.length).to.equal(1);
	});

	it("should update roots correctly", () => {
		const store = createStore();
		const data = fromSnapshot([
			"rootId: 1",
			"Add 1 <Fragment> to parent 1",
			"Add 2 <div> to parent 1",
		]);
		applyEvent(store, "operation_v2", data);
		expect(store.roots.$.length).to.equal(1);
	});

	it("should mount nodes", () => {
		const store = createStore();
		const data = fromSnapshot([
			"rootId: 1",
			"Add 1 <Fragment> to parent 1",
			"Add 2 <Parent> to parent 1",
		]);
		applyEvent(store, "operation_v2", data);
		expect(store.nodes.$.size).to.equal(2);
		expect(store.nodes.$.get(1)!.name).to.equal("Fragment");
		expect(store.nodes.$.get(1)!.children).to.deep.equal([2]);
		expect(store.nodes.$.get(2)!.name).to.equal("Parent");
	});

	it("should do nothing on legacy update timings", () => {
		const store = createStore();
		const data = fromSnapshot([
			"rootId: 1",
			"Add 1 <Fragment> to parent 1",
			"Add 2 <Parent> to parent 1",
		]);
		applyEvent(store, "operation_v2", data);
		expect(store.nodes.$.size).to.equal(2);

		const data2 = fromSnapshot([
			"rootId: 1",
			"Update timings 1 duration 2",
			"Update timings 2 duration 4",
		]);

		expect(() => applyEvent(store, "operation_v2", data2)).to.not.throw();
	});

	it("should update timings", () => {
		const store = createStore();
		const data = fromSnapshot([
			"rootId: 1",
			"Add 1 <Fragment> to parent 1",
			"Add 2 <Parent> to parent 1",
		]);
		applyEvent(store, "operation_v2", data);
		expect(store.nodes.$.size).to.equal(2);

		const data2 = fromSnapshot([
			"rootId: 1",
			"Update timings 1 time 2:5",
			"Update timings 2 time 3:4",
		]);

		applyEvent(store, "operation_v2", data2);

		expect(store.nodes.$.get(1)!.startTime).to.equal(2);
		expect(store.nodes.$.get(1)!.endTime).to.equal(5);
		expect(store.nodes.$.get(2)!.startTime).to.equal(3);
		expect(store.nodes.$.get(2)!.endTime).to.equal(4);
	});

	it("should remove nodes", () => {
		const store = createStore();
		const data = fromSnapshot([
			"rootId: 1",
			"Add 1 <Fragment> to parent -1",
			"Add 2 <Parent> to parent 1",
			"Add 3 <Foo> to parent 2",
		]);
		applyEvent(store, "operation_v2", data);
		expect(store.nodes.$.size).to.equal(3);

		const data2 = fromSnapshot([
			"rootId: 2",
			"Update timings 2 time 30:20",
			"Remove 3",
		]);
		applyEvent(store, "operation_v2", data2);
		expect(store.nodes.$.size).to.equal(2);
		expect(store.nodes.$.get(2)!.children).to.deep.equal([]);
	});

	it("should remove nodes in any order", () => {
		const store = createStore();
		const data = fromSnapshot([
			"rootId: 1",
			"Add 1 <Fragment> to parent 1",
			"Add 2 <Parent> to parent 1",
			"Add 3 <Foo> to parent 2",
		]);
		applyEvent(store, "operation_v2", data);
		expect(store.nodes.$.size).to.equal(3);

		const data2 = fromSnapshot(["rootId: 1", "Remove 2", "Remove 3"]);
		applyEvent(store, "operation_v2", data2);
		expect(store.nodes.$.size).to.equal(1);
		expect(store.nodes.$.get(1)!.children).to.deep.equal([]);
	});

	it("should not throw on removing non-existing node", () => {
		const store = createStore();
		const data = fromSnapshot(["rootId: 1", "Add 1 <Fragment> to parent 1"]);
		applyEvent(store, "operation_v2", data);

		const data2 = fromSnapshot(["rootId: 1", "Remove 99"]);
		applyEvent(store, "operation_v2", data2);
	});

	it("should reorder children", () => {
		const store = createStore();
		const data = fromSnapshot([
			"rootId: 1",
			"Add 1 <Fragment> to parent -1",
			"Add 2 <div> to parent 1",
			"Add 3 <span> to parent 1",
		]);
		applyEvent(store, "operation_v2", data);

		const data2 = fromSnapshot(["rootId: 1", "Reorder 1 [3, 2]"]);
		applyEvent(store, "operation_v2", data2);
		expect(store.nodes.$.get(1)!.children).to.deep.equal([3, 2]);
	});

	it("should reorder children #2", () => {
		const store = createStore();
		const data = fromSnapshot([
			"rootId: 1",
			"Add 1 <Fragment> to parent 1",
			"Add 2 <div> to parent 1",
			"Add 3 <span> to parent 1",
			"Add 4 <p> to parent 1",
			"Add 5 <i> to parent 1",
		]);
		applyEvent(store, "operation_v2", data);

		const data2 = fromSnapshot(["rootId: 1", "Reorder 1 [4, 3, 2, 5]"]);
		applyEvent(store, "operation_v2", data2);
		expect(store.nodes.$.get(1)!.children).to.deep.equal([4, 3, 2, 5]);
	});

	it("should apply after filter", () => {
		const store = createStore();
		const data = fromSnapshot([
			"rootId: 1",
			"Add 1 <Fragment> to parent -1",
			"Add 2 <StyleGuide> to parent 1",
			"Add 3 <TodoList> to parent 2",
			"Add 4 <TodoItem> to parent 3",
			"Add 5 <TodoItem> to parent 3",
			"Add 6 <TodoItem> to parent 3",
			"Add 7 <TodoItem> to parent 3",
			"Add 8 <TodoItem> to parent 3",
			"Add 9 <RadioBar> to parent 2",
			"Add 10 <LegacyContext> to parent 2",
			"Add 11 <Parent> to parent 10",
			"Add 12 <Child> to parent 11",
			"Add 13 <Stateful> to parent 2",
			"Add 14 <ShallowTree> to parent 2",
			"Add 15 <DeepNest> to parent 14",
			"Add 16 <DeepNest> to parent 15",
		]);

		applyEvent(store, "operation_v2", data);

		const data2 = fromSnapshot(["rootId: 1", "Remove 2"]);
		applyEvent(store, "operation_v2", data2);

		const data3 = fromSnapshot([
			"rootId: 1",
			"Add 17 <StyleGuide> to parent 1",
			"Add 3 <TodoList> to parent 17",
			"Add 4 <TodoItem> to parent 3",
			"Add 5 <TodoItem> to parent 3",
			"Add 6 <TodoItem> to parent 3",
			"Add 7 <TodoItem> to parent 3",
			"Add 8 <TodoItem> to parent 3",
			"Add 9 <RadioBar> to parent 17",
			"Add 10 <LegacyContext> to parent 17",
			"Add 11 <Parent> to parent 10",
			"Add 12 <Child> to parent 11",
			"Add 13 <Stateful> to parent 17",
			"Add 14 <ShallowTree> to parent 17",
			"Add 15 <DeepNest> to parent 14",
			"Add 16 <DeepNest> to parent 15",
			"Update timings 1 duration 20",
		]);
		applyEvent(store, "operation_v2", data3);

		expect(store.nodes.$.has(1)).to.be.true;
		expect(store.nodes.$.get(1)!.children).to.deep.equal([17]);
	});

	it("should update inspect data when inspected node is updated", () => {
		const spy = sinon.spy();
		const store = createStore();
		store.subscribe(spy);

		store.inspectData.$ = {
			id: 2,
			canEditHooks: false,
			canEditProps: false,
			canEditState: false,
			context: null,
			hooks: null,
			name: "Foo",
			props: null,
			state: null,
			type: "asd",
		};

		const data = fromSnapshot([
			"rootId: 2",
			"Add 2 <span> to parent -1",
			"Update timings 2 duration 10",
		]);
		applyEvent(store, "operation_v2", data);

		expect(spy.callCount).to.equal(1);
		expect(spy.args[0]).to.deep.equal(["inspect", 2]);
	});
});
