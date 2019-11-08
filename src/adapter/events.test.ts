import { expect } from "chai";
import { applyEvent } from "./events";
import { createStore } from "../view/store";
import { fromSnapshot } from "./debug";

describe("applyEvent", () => {
	it("should add roots", () => {
		const store = createStore();
		const data = fromSnapshot(["rootId: 1"]);
		applyEvent(store, "operation", data);
		expect(store.roots.$.length).to.equal(1);
	});

	it("should update roots correctly", () => {
		const store = createStore();
		const data = fromSnapshot([
			"rootId: 1",
			"Add 1 <Fragment> to parent 1",
			"Add 2 <div> to parent 1",
		]);
		applyEvent(store, "operation", data);
		expect(store.roots.$.length).to.equal(1);
	});

	it("should mount nodes", () => {
		const store = createStore();
		const data = fromSnapshot([
			"rootId: 1",
			"Add 1 <Fragment> to parent 1",
			"Add 2 <Parent> to parent 1",
		]);
		applyEvent(store, "operation", data);
		expect(store.nodes.$.size).to.equal(2);
		expect(store.nodes.$.get(1)!.name).to.equal("Fragment");
		expect(store.nodes.$.get(1)!.children).to.deep.equal([2]);
		expect(store.nodes.$.get(2)!.name).to.equal("Parent");
	});

	it("should update timings", () => {
		const store = createStore();
		const data = fromSnapshot([
			"rootId: 1",
			"Add 1 <Fragment> to parent 1",
			"Add 2 <Parent> to parent 1",
		]);
		applyEvent(store, "operation", data);
		expect(store.nodes.$.size).to.equal(2);

		const data2 = fromSnapshot([
			"rootId: 1",
			"Update timings 1 duration 2",
			"Update timings 2 duration 4",
		]);
		applyEvent(store, "operation", data2);
		expect(store.nodes.$.get(1)!.duration.$).to.equal(2);
		expect(store.nodes.$.get(2)!.duration.$).to.equal(4);
	});

	it("should remove nodes", () => {
		const store = createStore();
		const data = fromSnapshot([
			"rootId: 1",
			"Add 1 <Fragment> to parent 1",
			"Add 2 <Parent> to parent 1",
			"Add 3 <Foo> to parent 2",
		]);
		applyEvent(store, "operation", data);
		expect(store.nodes.$.size).to.equal(3);

		const data2 = fromSnapshot(["rootId: 1", "Remove 3"]);
		applyEvent(store, "operation", data2);
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
		applyEvent(store, "operation", data);
		expect(store.nodes.$.size).to.equal(3);

		const data2 = fromSnapshot(["rootId: 1", "Remove 2", "Remove 3"]);
		applyEvent(store, "operation", data2);
		expect(store.nodes.$.size).to.equal(1);
		expect(store.nodes.$.get(1)!.children).to.deep.equal([]);
	});

	it("should not throw on removing non-existing node", () => {
		const store = createStore();
		const data = fromSnapshot(["rootId: 1", "Add 1 <Fragment> to parent 1"]);
		applyEvent(store, "operation", data);

		const data2 = fromSnapshot(["rootId: 1", "Remove 99"]);
		applyEvent(store, "operation", data2);
	});

	it("should reorder children", () => {
		const store = createStore();
		const data = fromSnapshot([
			"rootId: 1",
			"Add 1 <Fragment> to parent 1",
			"Add 2 <div> to parent 1",
			"Add 3 <span> to parent 1",
		]);
		applyEvent(store, "operation", data);

		const data2 = fromSnapshot(["rootId: 1", "Reorder 1 [3, 2]"]);
		applyEvent(store, "operation", data2);
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
		applyEvent(store, "operation", data);

		const data2 = fromSnapshot(["rootId: 1", "Reorder 1 [4, 3, 2, 5]"]);
		applyEvent(store, "operation", data2);
		expect(store.nodes.$.get(1)!.children).to.deep.equal([4, 3, 2, 5]);
	});
});
