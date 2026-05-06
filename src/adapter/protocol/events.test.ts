import { expect, vi } from "vitest";
import { applyEvent } from "./events";
import { createStore } from "../../view/store";
import { fromSnapshot } from "../debug";
import { OPERATION_PROTOCOL_V3 } from "./v3";

function toV3(
	data: number[],
	{
		rendererId = 1,
		epoch = 1,
		commitSeq = 0,
		baseTreeVersion = 0,
		nextTreeVersion = 1,
	} = {},
) {
	return [
		OPERATION_PROTOCOL_V3,
		rendererId,
		epoch,
		commitSeq,
		baseTreeVersion,
		nextTreeVersion,
		data[0],
		0,
		...data,
	];
}

describe("applyEvent", () => {
	it("should add roots", () => {
		const store = createStore();
		const data = fromSnapshot(["rootId: 1"]);
		applyEvent(store, "operation_v2", data);
		expect(store.roots.value.length).to.equal(1);
	});

	it("should update roots correctly", () => {
		const store = createStore();
		const data = fromSnapshot([
			"rootId: 1",
			"Add 1 <Fragment> to parent 1",
			"Add 2 <div> to parent 1",
		]);
		applyEvent(store, "operation_v2", data);
		expect(store.roots.value.length).to.equal(1);
	});

	it("should mount nodes", () => {
		const store = createStore();
		const data = fromSnapshot([
			"rootId: 1",
			"Add 1 <Fragment> to parent 1",
			"Add 2 <Parent> to parent 1",
		]);
		applyEvent(store, "operation_v2", data);
		expect(store.nodes.value.size).to.equal(2);
		expect(store.nodes.value.get(1)!.name).to.equal("Fragment");
		expect(store.nodes.value.get(1)!.children).to.deep.equal([2]);
		expect(store.nodes.value.get(2)!.name).to.equal("Parent");
	});

	it("should do nothing on legacy update timings", () => {
		const store = createStore();
		const data = fromSnapshot([
			"rootId: 1",
			"Add 1 <Fragment> to parent 1",
			"Add 2 <Parent> to parent 1",
		]);
		applyEvent(store, "operation_v2", data);
		expect(store.nodes.value.size).to.equal(2);

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
		expect(store.nodes.value.size).to.equal(2);

		const data2 = fromSnapshot([
			"rootId: 1",
			"Update timings 1 time 2:5",
			"Update timings 2 time 3:4",
		]);

		applyEvent(store, "operation_v2", data2);

		expect(store.nodes.value.get(1)!.startTime).to.equal(2);
		expect(store.nodes.value.get(1)!.endTime).to.equal(5);
		expect(store.nodes.value.get(2)!.startTime).to.equal(3);
		expect(store.nodes.value.get(2)!.endTime).to.equal(4);
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
		expect(store.nodes.value.size).to.equal(3);

		const data2 = fromSnapshot([
			"rootId: 2",
			"Update timings 2 time 30:20",
			"Remove 3",
		]);
		applyEvent(store, "operation_v2", data2);
		expect(store.nodes.value.size).to.equal(2);
		expect(store.nodes.value.get(2)!.children).to.deep.equal([]);
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
		expect(store.nodes.value.size).to.equal(3);

		const data2 = fromSnapshot(["rootId: 1", "Remove 2", "Remove 3"]);
		applyEvent(store, "operation_v2", data2);
		expect(store.nodes.value.size).to.equal(1);
		expect(store.nodes.value.get(1)!.children).to.deep.equal([]);
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
		expect(store.nodes.value.get(1)!.children).to.deep.equal([3, 2]);
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
		expect(store.nodes.value.get(1)!.children).to.deep.equal([4, 3, 2, 5]);
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

		const data2 = fromSnapshot([
			"rootId: 1",
			"Update timings 1 time 12:20",
			"Remove 2",
		]);
		applyEvent(store, "operation_v2", data2);

		const data3 = fromSnapshot([
			"rootId: 1",
			"Update timings 1 time 12:20",
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

		expect(store.nodes.value.has(1)).to.be.true;
		expect(store.nodes.value.get(1)!.children).to.deep.equal([17]);
	});

	it("should update inspect data when inspected node is updated", () => {
		const spy = vi.fn();
		const store = createStore();
		store.subscribe(spy);

		store.inspectData.value = {
			id: 2,
			key: null,
			context: null,
			hooks: null,
			name: "Foo",
			props: null,
			state: null,
			signals: null,
			type: "asd",
			canSuspend: false,
			suspended: false,
			version: "",
		};

		const data = fromSnapshot([
			"rootId: 2",
			"Add 2 <span> to parent -1",
			"Update timings 2 duration 10",
		]);
		applyEvent(store, "operation_v2", data);

		expect(spy).toHaveBeenCalledTimes(1);
		expect(spy.mock.calls[0]).to.deep.equal(["inspect", 2]);
	});

	it("should reset uncollapsed state", () => {
		const store = createStore();

		store.inspectData.value = {
			id: 2,
			key: null,
			context: null,
			hooks: null,
			name: "Foo",
			props: null,
			state: null,
			signals: null,
			type: "asd",
			canSuspend: false,
			suspended: false,
			version: "",
		};

		store.sidebar.props.uncollapsed.value = ["a", "b", "c"];
		store.sidebar.state.uncollapsed.value = ["a", "b", "c"];
		store.sidebar.context.uncollapsed.value = ["a", "b", "c"];

		applyEvent(store, "inspect-result", {
			id: 42,
			name: "foo",
			key: null,
			type: "string",
			context: null,
			hooks: null,
			props: null,
			state: null,
		});

		expect(store.sidebar.props.uncollapsed.value).to.deep.equal([]);
		expect(store.sidebar.state.uncollapsed.value).to.deep.equal([]);
		expect(store.sidebar.context.uncollapsed.value).to.deep.equal([]);
	});

	it("should apply operation_v3 messages", () => {
		const store = createStore();
		const data = fromSnapshot([
			"rootId: 1",
			"Add 1 <Fragment> to parent -1",
			"Add 2 <Parent> to parent 1",
		]);

		applyEvent(store, "operation_v3", toV3(data));

		expect(store.nodes.value.size).to.equal(2);
		expect(store.nodes.value.get(1)!.children).to.deep.equal([2]);
		expect(store.operationV3.get(1)).to.deep.equal({
			epoch: 1,
			commitSeq: 0,
			treeVersion: 1,
		});
	});

	it("should request a v3 snapshot on skipped commits", () => {
		const spy = vi.fn();
		const store = createStore();
		store.subscribe(spy);

		const data = fromSnapshot(["rootId: 1", "Add 1 <Fragment> to parent -1"]);
		applyEvent(store, "operation_v3", toV3(data));

		const skipped = fromSnapshot(["rootId: 1", "Add 2 <Parent> to parent 1"]);
		applyEvent(
			store,
			"operation_v3",
			toV3(skipped, { commitSeq: 2, baseTreeVersion: 1, nextTreeVersion: 2 }),
		);

		expect(spy).toHaveBeenCalledWith("snapshot-request-v3", {
			rendererId: 1,
			reason: "sequence",
		});
		expect(store.nodes.value.has(2)).to.equal(false);
	});

	it("should replace state on snapshot_v3", () => {
		const store = createStore();
		const data = fromSnapshot(["rootId: 1", "Add 1 <Fragment> to parent -1"]);
		applyEvent(store, "operation_v3", toV3(data));

		const snapshot = fromSnapshot([
			"rootId: 10",
			"Add 10 <Fragment> to parent -1",
			"Add 11 <Parent> to parent 10",
		]);
		applyEvent(
			store,
			"snapshot_v3",
			toV3(snapshot, {
				commitSeq: 0,
				baseTreeVersion: 0,
				nextTreeVersion: 1,
			}),
		);

		expect(store.nodes.value.has(1)).to.equal(false);
		expect(store.nodes.value.get(10)!.children).to.deep.equal([11]);
	});

	it("should only replace the matching renderer on snapshot_v3", () => {
		const store = createStore();
		applyEvent(
			store,
			"operation_v3",
			toV3(
				fromSnapshot([
					"rootId: 1",
					"Add 1 <Fragment> to parent -1",
					"Add 2 <Parent> to parent 1",
				]),
				{ rendererId: 1 },
			),
		);
		applyEvent(
			store,
			"operation_v3",
			toV3(
				fromSnapshot([
					"rootId: 20",
					"Add 20 <Fragment> to parent -1",
					"Add 21 <Sibling> to parent 20",
				]),
				{ rendererId: 2 },
			),
		);

		applyEvent(
			store,
			"snapshot_v3",
			toV3(
				fromSnapshot([
					"rootId: 10",
					"Add 10 <Fragment> to parent -1",
					"Add 11 <Next> to parent 10",
				]),
				{
					rendererId: 1,
					commitSeq: 0,
					baseTreeVersion: 0,
					nextTreeVersion: 1,
				},
			),
		);

		expect(store.nodes.value.has(1)).to.equal(false);
		expect(store.nodes.value.has(2)).to.equal(false);
		expect(store.nodes.value.get(10)!.children).to.deep.equal([11]);
		expect(store.nodes.value.get(20)!.children).to.deep.equal([21]);
		expect(store.roots.value).to.deep.equal([20, 10]);
	});

	it("should clear a renderer on empty snapshot_v3", () => {
		const store = createStore();
		applyEvent(
			store,
			"operation_v3",
			toV3(
				fromSnapshot([
					"rootId: 1",
					"Add 1 <Fragment> to parent -1",
					"Add 2 <Parent> to parent 1",
				]),
			),
		);
		store.selection.selectById(2);

		applyEvent(store, "snapshot_v3", [
			OPERATION_PROTOCOL_V3,
			1,
			2,
			0,
			0,
			1,
			-1,
			0,
		]);

		expect(store.nodes.value.size).to.equal(0);
		expect(store.roots.value).to.deep.equal([]);
		expect(store.selection.selected.value).to.equal(-1);
		expect(store.operationV3.get(1)).to.deep.equal({
			epoch: 2,
			commitSeq: 0,
			treeVersion: 1,
		});
	});

	it("should repair selection when snapshot_v3 removes selected node", () => {
		const store = createStore();
		applyEvent(
			store,
			"operation_v3",
			toV3(
				fromSnapshot([
					"rootId: 1",
					"Add 1 <Fragment> to parent -1",
					"Add 2 <Parent> to parent 1",
				]),
				{ rendererId: 1 },
			),
		);
		applyEvent(
			store,
			"operation_v3",
			toV3(
				fromSnapshot([
					"rootId: 10",
					"Add 10 <Fragment> to parent -1",
					"Add 11 <Other> to parent 10",
				]),
				{ rendererId: 2 },
			),
		);
		store.selection.selectById(2);

		applyEvent(store, "snapshot_v3", [
			OPERATION_PROTOCOL_V3,
			1,
			2,
			0,
			0,
			1,
			-1,
			0,
		]);

		expect(store.selection.selected.value).to.equal(11);
		expect(store.selection.selectedIdx.value).to.equal(0);
	});
});
