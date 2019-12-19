import { valoo } from "../valoo";
import { expect } from "chai";
import { createPropsStore } from "./props";
import { InspectData } from "../../adapter/adapter/adapter";

const createStore = () => {
	const inspectData = valoo<InspectData | null>(null);
	const store = createPropsStore(inspectData, () =>
		inspectData.$ ? inspectData.$.props : null,
	);
	return { store, inspectData };
};

describe("Props Store", () => {
	it("should reset collapse on element change", () => {
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

	it("should collapse complex properties by default", () => {
		const { inspectData, store } = createStore();

		inspectData.$ = {
			id: 42,
			name: "foo",
			type: "string",
			context: null,
			canEditHooks: false,
			hooks: null,
			canEditProps: false,
			props: {
				foo: {
					bar: 123,
				},
				bob: [1, 2, 3],
			},
			canEditState: false,
			state: null,
		};

		expect(Array.from(store.collapser.collapsed.$)).to.deep.equal([
			"root.foo",
			"root.bob",
		]);
	});

	it("should NOT collapse by default when user un/collapsed something", () => {
		const { inspectData, store } = createStore();
		store.collapser.collapsed.update(v => {
			v.add("root.foo");
		});

		inspectData.$ = {
			id: -1, // Use same id as default
			name: "foo",
			type: "string",
			context: null,
			canEditHooks: false,
			hooks: null,
			canEditProps: false,
			props: {
				foo: {
					bar: 123,
				},
				bob: [1, 2, 3],
			},
			canEditState: false,
			state: null,
		};

		expect(Array.from(store.collapser.collapsed.$)).to.deep.equal(["root.foo"]);
	});
});
