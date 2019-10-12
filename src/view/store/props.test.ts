import { valoo } from "../valoo";
import * as sinon from "sinon";
import { expect } from "chai";
import { createPropsStore } from "./props";
import { InspectData } from "../../adapter/adapter";

const createStore = () => {
	const selected = valoo(-1);
	const inspectData = valoo<InspectData | null>(null);
	const spy = sinon.spy();
	const store = createPropsStore(inspectData, selected, () => inspectData, spy);
	return { selected, spy, store, inspectData };
};

describe("Props Store", () => {
	it("should reset collapse new selected", () => {
		const { inspectData, store } = createStore();
		store.collapser.collapsed.update(v => {
			v.add("foo");
		});

		inspectData.$ = {
			id: 42,
			name: "foo",
			type: "string",
			context: null,
			canEditHooks: false,
			hooks: null,
			canEditProps: false,
			props: null,
			canEditState: false,
			state: null,
		};
		expect(store.collapser.collapsed.$.size).to.equal(0);
	});

	it("should not call inspect on getting new data", () => {
		const { spy, inspectData } = createStore();
		inspectData.$ = null;
		expect(spy.callCount).to.equal(0);
	});
});
