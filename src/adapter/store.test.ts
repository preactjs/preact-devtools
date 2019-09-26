import { createStore } from "../view/store";
import { applyOperations } from "./events";
import { expect } from "chai";
import { fromSnapshot } from "./debug";

describe("Store", () => {
	it("should apply mounts", () => {
		const store = createStore();
		const event = fromSnapshot([
			"rootId: 1",
			"Add 1 <Fragment> to parent 1",
			"Add 2 <div> to parent 1",
			"Add 3 <span> to parent 2",
			"Add 4 <#text> to parent 3",
			"Add 5 <span> to parent 2",
			"Add 6 <#text> to parent 5",
		]);
		applyOperations(store, event);

		expect(store.nodes.$.get(1)!.children).to.deep.equal([2]);
		expect(store.nodes.$.get(2)!.children).to.deep.equal([3, 5]);
		expect(store.nodes.$.get(3)!.children).to.deep.equal([4]);
	});

	it("should update durations", () => {
		const store = createStore();
		const event = fromSnapshot([
			"rootId: 1",
			"Add 1 <Fragment> to parent 1",
			"Add 2 <div> to parent 1",
		]);
		applyOperations(store, event);

		// prettier-ignore
		const event2 = fromSnapshot([
      "rootId: 1",
      "Update timings 1 duration 12"
    ]);
		applyOperations(store, event2);

		expect(store.nodes.$.get(1)!.duration.$).to.equal(12);
	});

	it("should collapse nodes", () => {
		const store = createStore();
		const event = fromSnapshot([
			"rootId: 1",
			"Add 1 <Fragment> to parent 1",
			"Add 2 <div> to parent 1",
			"Add 3 <span> to parent 2",
		]);
		applyOperations(store, event);

		store.actions.collapseNode(2);
		expect(store.visiblity.hidden.$).to.deep.equal(new Set([3]));
	});
});
