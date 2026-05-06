import { expect } from "vitest";
import { DevNodeType, Tree } from "./types";
import { TreeStore } from "./tree";

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

function expectRanks(store: TreeStore) {
	for (let i = 0; i < store.visibleSize(); i++) {
		const id = store.visibleAt(i)!;
		expect(store.rankOf(id)).to.equal(i);
	}
}

describe("TreeStore", () => {
	it("resolves visible nodes by rank", () => {
		const store = new TreeStore();
		store.sync(createTree(), [1], false);

		expect(store.visibleSize()).to.equal(5);
		expect(store.visibleRange(0, 5)).to.deep.equal([1, 2, 4, 5, 3]);
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

	it("can hide root rows without hiding descendants", () => {
		const store = new TreeStore();
		store.sync(createTree(), [1], true);

		expect(store.visibleSize()).to.equal(4);
		expect(store.visibleRange(0, 4)).to.deep.equal([2, 4, 5, 3]);
		expectRanks(store);
	});
});
