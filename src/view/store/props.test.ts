import { valoo } from "../valoo";
import { expect } from "chai";
import { createPropsStore } from "./props";
import { InspectData } from "../../adapter/adapter/adapter";

const createStore = () => {
	const inspectData = valoo<InspectData | null>(null);
	const store = createPropsStore(inspectData, () => inspectData);
	return { store, inspectData };
};

describe.skip("Props Store", () => {
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
});
