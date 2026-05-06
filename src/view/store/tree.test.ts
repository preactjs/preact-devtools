import { expect } from "vitest";
import { DevNodeType, Tree } from "./types";
import { TreeStore, TreeSyncChanges } from "./tree";

function node(id: number, parent: number, children: number[] = []) {
	return {
		children,
		depth: parent === -1 ? 0 : id === 2 || id === 3 ? 1 : 2,
		endTime: 0,
		hocs: null,
		id,
		key: null,
		name: `Node${id}`,
		owner: -1,
		parent,
		startTime: 0,
		type: DevNodeType.FunctionComponent,
	};
}

function createTree() {
	const tree: Tree = new Map();
	tree.set(1, node(1, -1, [2, 3]));
	tree.set(2, node(2, 1, [4, 5]));
	tree.set(3, node(3, 1));
	tree.set(4, node(4, 2));
	tree.set(5, node(5, 2));
	return tree;
}

function cloneTree(tree: Tree) {
	const next: Tree = new Map();
	tree.forEach((n, id) => {
		next.set(id, {
			...n,
			children: n.children.slice(),
			hocs: n.hocs?.slice() || null,
		});
	});
	return next;
}

function expectRanks(store: TreeStore) {
	for (let i = 0; i < store.visibleSize(); i++) {
		const id = store.visibleAt(i)!;
		expect(store.rankOf(id)).to.equal(i);
	}
}

function expectSameVisible(actual: TreeStore, expected: TreeStore) {
	const size = expected.visibleSize();
	expect(actual.visibleSize()).to.equal(size);
	expect(actual.visibleRange(0, size)).to.deep.equal(
		expected.visibleRange(0, size),
	);

	for (let i = 0; i < size; i++) {
		const id = expected.visibleAt(i)!;
		expect(actual.visibleAt(i)).to.equal(id);
		expect(actual.rankOf(id)).to.equal(i);
	}
}

function searchEntries(store: TreeStore) {
	const entries: Array<[number, string, string[] | null]> = [];
	store.forEachSearchEntry((id, name, hocs) => {
		entries.push([id, name, hocs]);
	});
	return entries;
}

describe("TreeStore", () => {
	it("resolves visible nodes by rank", () => {
		const store = new TreeStore();
		store.sync(createTree(), [1], false);

		expect(store.visibleSize()).to.equal(5);
		expect(store.visibleRange(0, 5)).to.deep.equal([1, 2, 4, 5, 3]);
		expect(store.visibleRange(1, 4)).to.deep.equal([2, 4, 5]);
		expectRanks(store);
	});

	it("updates visible counts when nodes collapse", () => {
		const store = new TreeStore();
		store.sync(createTree(), [1], false);
		store.setCollapsed(2, true);

		expect(store.visibleSize()).to.equal(3);
		expect(store.visibleRange(0, 3)).to.deep.equal([1, 2, 3]);
		expect(store.rankOf(4)).to.equal(-1);
		expectRanks(store);
	});

	it("keeps hidden subtree collapse changes local until ancestors expand", () => {
		const store = new TreeStore();
		store.sync(createTree(), [1], false);
		store.setCollapsed(1, true);

		const layoutVersion = store.structureVersion.value;
		store.setCollapsed(2, true);

		expect(store.visibleSize()).to.equal(1);
		expect(store.visibleRange(0, 1)).to.deep.equal([1]);
		expect(store.structureVersion.value).to.equal(layoutVersion);

		store.setCollapsed(1, false);
		expect(store.visibleSize()).to.equal(3);
		expect(store.visibleRange(0, 3)).to.deep.equal([1, 2, 3]);

		store.setCollapsed(2, false);
		expect(store.visibleSize()).to.equal(5);
		expect(store.visibleRange(0, 5)).to.deep.equal([1, 2, 4, 5, 3]);
	});

	it("can hide root rows without hiding descendants", () => {
		const store = new TreeStore();
		store.sync(createTree(), [1], true);

		expect(store.visibleSize()).to.equal(4);
		expect(store.visibleRange(0, 4)).to.deep.equal([2, 4, 5, 3]);
		expectRanks(store);
	});

	it("toggles root visibility without changing descendant order", () => {
		const store = new TreeStore();
		store.sync(createTree(), [1], false);

		store.setRootHidden(true);
		expect(store.visibleSize()).to.equal(4);
		expect(store.visibleRange(0, 4)).to.deep.equal([2, 4, 5, 3]);
		expect(store.visibleRange(1, 3)).to.deep.equal([4, 5]);
		expectRanks(store);

		store.setRootHidden(false);
		expect(store.visibleSize()).to.equal(5);
		expect(store.visibleRange(0, 5)).to.deep.equal([1, 2, 4, 5, 3]);
		expect(store.visibleRange(2, 5)).to.deep.equal([4, 5, 3]);
		expectRanks(store);
	});

	it("does not invalidate visible layout for timing-only updates", () => {
		const store = new TreeStore();
		const tree = createTree();
		store.sync(tree, [1], false);

		const layoutVersion = store.structureVersion.value;
		const nodeVersion = store.versionOfNode(1).value;
		const next = new Map(tree);
		next.set(1, { ...tree.get(1)!, startTime: 10, endTime: 20 });

		store.sync(next, [1], false);

		expect(store.structureVersion.value).to.equal(layoutVersion);
		expect(store.versionOfNode(1).value).to.equal(nodeVersion);
	});

	it("invalidates only the changed node for display-only updates", () => {
		const store = new TreeStore();
		const tree = createTree();
		store.sync(tree, [1], false);

		const layoutVersion = store.structureVersion.value;
		const nodeVersion = store.versionOfNode(2).value;
		const next = new Map(tree);
		next.set(2, { ...tree.get(2)!, name: "Renamed" });

		store.sync(next, [1], false);

		expect(store.structureVersion.value).to.equal(layoutVersion);
		expect(store.versionOfNode(2).value).to.equal(nodeVersion + 1);
	});

	it("keeps search entries in sync with visibility and display updates", () => {
		const store = new TreeStore();
		const tree = createTree();
		store.sync(tree, [1], false);

		expect(searchEntries(store).map(([id]) => id)).to.deep.equal([
			1, 2, 4, 5, 3,
		]);

		store.setCollapsed(2, true);
		expect(searchEntries(store).map(([id]) => id)).to.deep.equal([1, 2, 3]);

		const renamed = new Map(tree);
		renamed.set(3, { ...tree.get(3)!, hocs: ["memo"], name: "Renamed" });
		store.sync(renamed, [1], false);
		expect(searchEntries(store)).to.deep.include([3, "Renamed", ["memo"]]);

		const removed = new Map(renamed);
		removed.set(1, { ...renamed.get(1)!, children: [2] });
		removed.delete(3);
		store.sync(removed, [1], false);
		expect(searchEntries(store).map(([id]) => id)).to.deep.equal([1, 2]);
	});

	it("invalidates visible layout for structural updates", () => {
		const store = new TreeStore();
		const tree = createTree();
		store.sync(tree, [1], false);

		const layoutVersion = store.structureVersion.value;
		const next = new Map(tree);
		next.set(2, { ...tree.get(2)!, children: [4] });
		next.delete(5);

		store.sync(next, [1], false);

		expect(store.structureVersion.value).to.equal(layoutVersion + 1);
		expect(store.visibleRange(0, 4)).to.deep.equal([1, 2, 4, 3]);
	});

	it("keeps incremental sync equivalent to a full rebuild", () => {
		const tree = createTree();
		const incremental = new TreeStore();
		const rebuilt = new TreeStore();
		let roots = [1];

		incremental.sync(tree, roots, false);
		rebuilt.sync(cloneTree(tree), roots, false);

		const sync = (changes: TreeSyncChanges) => {
			incremental.sync(tree, roots, false, changes);
			rebuilt.sync(cloneTree(tree), roots.slice(), false);
			expectSameVisible(incremental, rebuilt);
		};

		const parent = tree.get(2)!;
		parent.children = parent.children.concat(6);
		tree.set(2, parent);
		tree.set(6, node(6, 2));
		sync({
			dirty: [2, 6],
			addedSubtreeRoots: [6],
			structural: true,
			incremental: true,
		});

		tree.set(2, { ...tree.get(2)!, children: [6, 4, 5] });
		sync({
			dirty: [2],
			structural: true,
			incremental: true,
		});

		const beforeDisplayUpdate = incremental.structureVersion.value;
		tree.set(6, { ...tree.get(6)!, hocs: ["memo"], name: "Renamed" });
		sync({
			dirty: [6],
			structural: false,
			incremental: true,
		});
		expect(incremental.structureVersion.value).to.equal(beforeDisplayUpdate);

		tree.set(2, { ...tree.get(2)!, children: [6, 5] });
		tree.delete(4);
		sync({
			dirty: [2, 4],
			removed: [4],
			removedSubtreeRoots: [{ id: 4, parent: 2 }],
			structural: true,
			incremental: true,
		});

		incremental.setCollapsed(2, true);
		rebuilt.setCollapsed(2, true);
		expectSameVisible(incremental, rebuilt);

		tree.set(2, { ...tree.get(2)!, children: [6, 5, 7] });
		tree.set(7, node(7, 2));
		sync({
			dirty: [2, 7],
			addedSubtreeRoots: [7],
			structural: true,
			incremental: true,
		});

		tree.set(2, { ...tree.get(2)!, children: [6, 5] });
		tree.delete(7);
		sync({
			dirty: [2, 7],
			removed: [7],
			removedSubtreeRoots: [{ id: 7, parent: 2 }],
			structural: true,
			incremental: true,
		});

		roots = [8, 1];
		tree.set(8, node(8, -1));
		sync({
			dirty: [8],
			addedSubtreeRoots: [8],
			structural: true,
			incremental: true,
		});

		incremental.setRootHidden(true);
		rebuilt.setRootHidden(true);
		expectSameVisible(incremental, rebuilt);
	});
});
