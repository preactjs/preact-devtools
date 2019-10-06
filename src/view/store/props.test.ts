import { valoo } from "../valoo";
import * as sinon from "sinon";
import { expect } from "chai";
import { createPropsStore } from "./props";
import { InspectData } from "../../adapter/adapter";

const createStore = () => {
	const selected = valoo(-1);
	const inspectData = valoo<InspectData | null>(null);
	const spy = sinon.spy();
	const store = createPropsStore(inspectData, selected, spy);
	return { selected, spy, store, inspectData };
};

describe("Props Store", () => {
	it("should call inspect", () => {
		const { spy, selected } = createStore();
		expect(spy.callCount).to.equal(0);

		selected.$ = 2;
		expect(spy.callCount).to.equal(1);
		expect(spy.args[0]).to.deep.equal(["inspect", 2]);
	});

	it("should reset collapse new selected", () => {
		const { selected, store } = createStore();
		store.collapser.collapsed.update(v => {
			v.add("foo");
		});

		selected.$ = 2;
		expect(store.collapser.collapsed.$.size).to.equal(0);
	});

	it("should not call inspect on getting new data", () => {
		const { spy, inspectData } = createStore();
		inspectData.$ = null;
		expect(spy.callCount).to.equal(0);
	});
});
