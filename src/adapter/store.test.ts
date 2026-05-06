import { createStore } from "../view/store";
import { applyOperationsV2 } from "./protocol/events";
import { expect, vi } from "vitest";
import { fromSnapshot } from "./debug";

describe("Store", () => {
	it("should apply mounts", () => {
		const store = createStore();
		const event = fromSnapshot([
			"rootId: 1",
			"Add 1 <Fragment> to parent -1",
			"Add 2 <div> to parent 1",
			"Add 3 <span> to parent 2",
			"Add 4 <#text> to parent 3",
			"Add 5 <span> to parent 2",
			"Add 6 <#text> to parent 5",
		]);
		applyOperationsV2(store, event);

		expect(store.tree.toMap().get(1)!.children).to.deep.equal([2]);
		expect(store.tree.toMap().get(2)!.children).to.deep.equal([3, 5]);
		expect(store.tree.toMap().get(3)!.children).to.deep.equal([4]);
	});

	it("should update durations", () => {
		const store = createStore();
		const event = fromSnapshot([
			"rootId: 1",
			"Add 1 <Fragment> to parent -1",
			"Add 2 <div> to parent 1",
		]);
		applyOperationsV2(store, event);

		// prettier-ignore
		const event2 = fromSnapshot([
      "rootId: 1",
      "Update timings 1 time 12:15"
    ]);
		applyOperationsV2(store, event2);

		expect(store.tree.toMap().get(1)!.startTime).to.equal(12);
		expect(store.tree.toMap().get(1)!.endTime).to.equal(15);
	});

	it("should use TreeStore as the source for v2 operations", () => {
		const store = createStore();
		const event = fromSnapshot([
			"rootId: 1",
			"Add 1 <Fragment> to parent -1",
			"Add 2 <div> to parent 1",
		]);
		applyOperationsV2(store, event);

		const event2 = fromSnapshot(["rootId: 1", "Add 3 <span> to parent 1"]);
		applyOperationsV2(store, event2);

		expect(store.tree.get(1)!.children).to.deep.equal([2, 3]);
		expect(store.tree.toMap().get(1)!.children).to.deep.equal([2, 3]);
		expect(store.tree.getRoots()).to.deep.equal([1]);
	});

	it("should keep visible counts correct for incremental adds under collapsed parents", () => {
		const store = createStore();
		const event = fromSnapshot([
			"rootId: 1",
			"Add 1 <Fragment> to parent -1",
			"Add 2 <Parent> to parent 1",
		]);
		applyOperationsV2(store, event);

		store.tree.setCollapsed(2, true);
		expect(store.tree.visibleRange(0, store.tree.visibleSize())).to.deep.equal([
			2,
		]);

		const event2 = fromSnapshot(["rootId: 1", "Add 3 <Child> to parent 2"]);
		applyOperationsV2(store, event2);

		expect(store.tree.visibleRange(0, store.tree.visibleSize())).to.deep.equal([
			2,
		]);

		store.tree.setCollapsed(2, false);
		expect(store.tree.visibleRange(0, store.tree.visibleSize())).to.deep.equal([
			2, 3,
		]);
	});

	it("should keep visible counts correct for incremental removals under collapsed parents", () => {
		const store = createStore();
		const event = fromSnapshot([
			"rootId: 1",
			"Add 1 <Fragment> to parent -1",
			"Add 2 <Parent> to parent 1",
			"Add 3 <Child> to parent 2",
		]);
		applyOperationsV2(store, event);

		store.tree.setCollapsed(2, true);
		const event2 = fromSnapshot(["rootId: 1", "Remove 3"]);
		applyOperationsV2(store, event2);

		expect(store.tree.visibleRange(0, store.tree.visibleSize())).to.deep.equal([
			2,
		]);

		store.tree.setCollapsed(2, false);
		expect(store.tree.visibleRange(0, store.tree.visibleSize())).to.deep.equal([
			2,
		]);
	});

	it("should unmount vnodes", () => {
		const store = createStore();
		const event = fromSnapshot([
			"rootId: 1",
			"Add 1 <Fragment> to parent -1",
			"Add 2 <div> to parent 1",
			"Add 3 <div> to parent 2",
		]);
		applyOperationsV2(store, event);

		const spy = vi.fn();
		store.tree.subscribeStructure(spy);
		spy.mockClear();

		// prettier-ignore
		const event2 = fromSnapshot([
      "rootId: 1",
      "Remove 2",
      "Remove 3",
    ]);
		applyOperationsV2(store, event2);

		expect(spy).toHaveBeenCalledTimes(1);
		expect(store.tree.toMap().get(1)!.children).to.deep.equal([]);
		expect(store.tree.toMap().get(2)).to.equal(undefined);
		expect(store.tree.toMap().get(3)).to.equal(undefined);
	});

	it("should reset inspectData on clear()", () => {
		const store = createStore();
		store.inspectData.value = {
			canSuspend: false,
			context: null,
			hooks: null,
			id: 123,
			key: null,
			name: "Foo",
			props: null,
			state: null,
			signals: null,
			suspended: false,
			type: 1,
			version: "",
		};
		store.clear();
		expect(store.inspectData.value).to.equal(null);
	});

	it("should only parse hooks when hooks are supported", () => {
		const store = createStore();
		const hooks = [
			{
				id: "root",
				name: "root",
				type: "object" as const,
				value: null,
				editable: false,
				depth: 0,
				meta: null,
				children: ["root.0"],
			},
			{
				id: "root.0",
				name: "State",
				type: "number" as const,
				value: 1,
				editable: true,
				depth: 1,
				meta: null,
				children: [],
			},
		];

		store.inspectData.value = {
			canSuspend: false,
			context: null,
			hooks,
			id: 123,
			key: null,
			name: "Foo",
			props: null,
			state: null,
			signals: null,
			suspended: false,
			type: 1,
			version: "",
		};

		expect(store.sidebar.hooks.items.value).to.deep.equal([]);

		store.supports.hooks.value = true;

		expect(store.sidebar.hooks.items.value).to.deep.equal([hooks[1]]);
	});

	it("should search through the tree store", () => {
		vi.useFakeTimers();
		try {
			const store = createStore();
			const event = fromSnapshot([
				"rootId: 1",
				"Add 1 <Fragment> to parent -1",
				"Add 2 <Parent> to parent 1",
				"Add 3 <Child> to parent 2",
			]);
			applyOperationsV2(store, event);

			store.search.onChange("child");
			vi.runAllTimers();

			expect(store.search.match.value).to.deep.equal([3]);
			store.search.selectNext();
			expect(store.search.selectedIdx.value).to.equal(1);
		} finally {
			vi.useRealTimers();
		}
	});

	it("should keep profiler snapshots scoped to the committed root", () => {
		const store = createStore();
		store.profiler.isRecording.value = true;
		const event1 = fromSnapshot([
			"rootId: 1",
			"Add 1 <Fragment> to parent -1",
			"Add 2 <Parent> to parent 1",
		]);
		const event2 = fromSnapshot([
			"rootId: 10",
			"Add 10 <Fragment> to parent -1",
			"Add 11 <Other> to parent 10",
		]);

		applyOperationsV2(store, event1);
		applyOperationsV2(store, event2);

		expect(store.profiler.commits.value[0].nodes.has(1)).to.equal(true);
		expect(store.profiler.commits.value[0].nodes.has(10)).to.equal(false);
	});
});
