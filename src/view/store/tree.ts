import { signal, Signal } from "@preact/signals";
import { ID, DevNode, Tree } from "./types";

export interface TreeSyncChanges {
	dirty: ID[];
	removed?: ID[];
	structural: boolean;
}

export class TreeStore {
	private nodes: Tree = new Map();
	private roots: ID[] = [];
	private collapsed = new Set<ID>();
	private visibleCounts = new Map<ID, number>();
	private visibleTotal = 0;
	private visibleRanks: Map<ID, number> | null = null;
	private nodeListeners = new Map<ID, Set<() => void>>();
	private structureListeners = new Set<() => void>();
	private nodeVersions = new Map<ID, Signal<number>>();
	private rootHidden = false;

	readonly version: Signal<number> = signal(0);
	readonly structureVersion: Signal<number> = signal(0);

	sync(
		tree: Tree,
		roots: ID[],
		rootHidden: boolean,
		changes?: TreeSyncChanges,
	) {
		const prevNodes = this.nodes;
		const prevRoots = this.roots;
		const rootsChanged = !sameIds(prevRoots, roots);
		const structural = rootHidden !== this.rootHidden || rootsChanged;
		const nextChanges: TreeSyncChanges =
			changes || this.getChanges(prevNodes, tree, structural);
		const isStructural = nextChanges.structural || structural;
		this.nodes = tree;
		this.roots = roots.slice();
		this.rootHidden = rootHidden;
		this.collapsed.forEach(id => {
			if (!this.nodes.has(id)) this.collapsed.delete(id);
		});
		if (isStructural) {
			this.recomputeVisibleCounts();
		}
		this.bump(nextChanges.dirty, isStructural);
		if (nextChanges.removed) {
			for (let i = 0; i < nextChanges.removed.length; i++) {
				this.nodeVersions.delete(nextChanges.removed[i]);
			}
		} else {
			prevNodes.forEach((_, id) => {
				if (!tree.has(id)) this.nodeVersions.delete(id);
			});
		}
	}

	clear() {
		const dirty = Array.from(this.nodes.keys());
		this.nodes = new Map();
		this.roots = [];
		this.collapsed.clear();
		this.visibleCounts.clear();
		this.visibleTotal = 0;
		this.visibleRanks = null;
		this.bump(dirty, true);
		this.nodeVersions.clear();
	}

	get(id: ID): DevNode | null {
		return this.nodes.get(id) || null;
	}

	getRoots(): ID[] {
		return this.roots.slice();
	}

	rootCount(): number {
		return this.roots.length;
	}

	isRoot(id: ID): boolean {
		return this.roots.indexOf(id) !== -1;
	}

	toMap(): Tree {
		return this.nodes;
	}

	setRootHidden(value: boolean) {
		if (this.rootHidden === value) return;
		this.rootHidden = value;
		this.recomputeVisibleCounts();
		this.bump([], true);
	}

	isCollapsed(id: ID): boolean {
		return this.collapsed.has(id);
	}

	setCollapsed(id: ID, collapsed: boolean) {
		const node = this.nodes.get(id);
		if (!node || this.collapsed.has(id) === collapsed) return;

		const before = this.visibleCounts.get(id) || 0;
		if (collapsed) this.collapsed.add(id);
		else this.collapsed.delete(id);
		const after = this.computeVisibleCount(id);
		const delta = after - before;
		const affectsVisibleLayout = this.areAncestorsExpanded(node);
		if (affectsVisibleLayout && delta !== 0) {
			this.visibleTotal += delta;
			this.updateAncestorVisibleCounts(node.parent, delta);
		}
		this.bump([id], affectsVisibleLayout && delta !== 0);
	}

	subscribeNode(id: ID, fn: () => void) {
		let listeners = this.nodeListeners.get(id);
		if (!listeners) {
			listeners = new Set();
			this.nodeListeners.set(id, listeners);
		}
		listeners.add(fn);

		return () => {
			listeners!.delete(fn);
			if (listeners!.size === 0) {
				this.nodeListeners.delete(id);
			}
		};
	}

	subscribeStructure(fn: () => void) {
		this.structureListeners.add(fn);
		return () => this.structureListeners.delete(fn);
	}

	versionOfNode(id: ID): Signal<number> {
		let version = this.nodeVersions.get(id);
		if (!version) {
			version = signal(0);
			this.nodeVersions.set(id, version);
		}
		return version;
	}

	visibleSize(): number {
		return this.visibleTotal;
	}

	visibleRange(start: number, end: number): ID[] {
		const out: ID[] = [];
		const size = this.visibleSize();
		const from = Math.max(0, start);
		const to = Math.min(size, end);
		if (from >= to) return out;

		let index = 0;
		for (let i = 0; i < this.roots.length && index < to; i++) {
			const id = this.roots[i];
			const count = this.visibleCounts.get(id) || 0;
			if (index + count <= from) {
				index += count;
				continue;
			}
			index = this.pushVisibleRange(id, index, from, to, out);
		}

		return out;
	}

	forEachVisible(fn: (id: ID, node: DevNode) => void | false) {
		for (let i = 0; i < this.roots.length; i++) {
			if (this.forEachVisibleNode(this.roots[i], fn) === false) return;
		}
	}

	visibleAt(index: number): ID | null {
		if (index < 0) return null;

		for (let i = 0; i < this.roots.length; i++) {
			const root = this.nodes.get(this.roots[i]);
			if (!root) continue;

			const visibleCount = this.visibleCounts.get(root.id) || 0;
			if (index >= visibleCount) {
				index -= visibleCount;
				continue;
			}

			return this.visibleAtNode(root, index);
		}

		return null;
	}

	rankOf(id: ID): number {
		if (!this.visibleRanks) this.recomputeVisibleRanks();
		const rank = this.visibleRanks!.get(id);
		return rank === undefined ? -1 : rank;
	}

	private visibleAtNode(node: DevNode, index: number): ID | null {
		if (this.isNodeSelfVisible(node)) {
			if (index === 0) return node.id;
			index--;
		}

		if (this.collapsed.has(node.id)) return null;

		for (let i = 0; i < node.children.length; i++) {
			const child = this.nodes.get(node.children[i]);
			if (!child) continue;

			const visibleCount = this.visibleCounts.get(child.id) || 0;
			if (index >= visibleCount) {
				index -= visibleCount;
				continue;
			}

			return this.visibleAtNode(child, index);
		}

		return null;
	}

	private pushVisibleRange(
		id: ID,
		index: number,
		from: number,
		to: number,
		out: ID[],
	): number {
		const node = this.nodes.get(id);
		if (!node) return index;

		if (this.isNodeSelfVisible(node)) {
			if (index >= from && index < to) out.push(node.id);
			index++;
			if (index >= to) return index;
		}

		if (this.collapsed.has(node.id)) return index;

		for (let i = 0; i < node.children.length && index < to; i++) {
			const childId = node.children[i];
			const count = this.visibleCounts.get(childId) || 0;
			if (index + count <= from) {
				index += count;
				continue;
			}
			index = this.pushVisibleRange(childId, index, from, to, out);
		}

		return index;
	}

	private forEachVisibleNode(
		id: ID,
		fn: (id: ID, node: DevNode) => void | false,
	): void | false {
		const node = this.nodes.get(id);
		if (!node) return;

		if (this.isNodeSelfVisible(node) && fn(node.id, node) === false) {
			return false;
		}
		if (this.collapsed.has(node.id)) return;

		for (let i = 0; i < node.children.length; i++) {
			if (this.forEachVisibleNode(node.children[i], fn) === false) {
				return false;
			}
		}
	}

	private recomputeVisibleCounts() {
		this.visibleCounts.clear();
		this.visibleTotal = 0;
		this.visibleRanks = null;
		for (let i = this.roots.length; i--; ) {
			this.visibleTotal += this.computeVisibleCount(this.roots[i]);
		}
	}

	private recomputeVisibleRanks() {
		const ranks = new Map<ID, number>();
		let rank = 0;
		this.forEachVisible(id => {
			ranks.set(id, rank++);
		});
		this.visibleRanks = ranks;
	}

	private computeVisibleCount(id: ID): number {
		const node = this.nodes.get(id);
		if (!node) return 0;

		let total = this.isNodeSelfVisible(node) ? 1 : 0;
		if (!this.collapsed.has(node.id)) {
			for (let i = 0; i < node.children.length; i++) {
				total += this.computeVisibleCount(node.children[i]);
			}
		}

		this.visibleCounts.set(id, total);
		return total;
	}

	private updateAncestorVisibleCounts(id: ID, delta: number) {
		while (id !== -1) {
			const count = this.visibleCounts.get(id);
			if (count !== undefined) {
				this.visibleCounts.set(id, count + delta);
			}

			const node = this.nodes.get(id);
			if (!node) return;
			id = node.parent;
		}
	}

	private isNodeSelfVisible(node: DevNode) {
		return !(this.rootHidden && node.parent === -1);
	}

	private areAncestorsExpanded(node: DevNode) {
		let id = node.parent;
		while (id !== -1) {
			if (this.collapsed.has(id)) return false;
			const parent = this.nodes.get(id);
			if (!parent) return false;
			id = parent.parent;
		}
		return true;
	}

	private getChanges(
		prev: Tree,
		next: Tree,
		structural: boolean,
	): TreeSyncChanges {
		const dirty: ID[] = [];
		const removed: ID[] = [];
		next.forEach((node, id) => {
			const old = prev.get(id);
			if (!old) {
				dirty.push(id);
				structural = true;
			} else if (didDisplayNodeChange(old, node)) {
				dirty.push(id);
				if (didVisibleStructureChange(old, node)) structural = true;
			}
		});
		prev.forEach((_, id) => {
			if (!next.has(id)) {
				dirty.push(id);
				removed.push(id);
				structural = true;
			}
		});
		return { dirty, removed, structural };
	}

	private bump(dirty: ID[] = [], structural = false) {
		this.version.value++;
		for (let i = 0; i < dirty.length; i++) {
			const version = this.nodeVersions.get(dirty[i]);
			if (version) version.value++;
			const listeners = this.nodeListeners.get(dirty[i]);
			if (listeners) listeners.forEach(fn => fn());
		}
		if (structural) {
			this.visibleRanks = null;
			this.structureVersion.value++;
			this.structureListeners.forEach(fn => fn());
		}
	}
}

function sameIds(a: ID[], b: ID[]) {
	if (a.length !== b.length) return false;
	for (let i = 0; i < a.length; i++) {
		if (a[i] !== b[i]) return false;
	}
	return true;
}

function didDisplayNodeChange(a: DevNode, b: DevNode) {
	if (a === b) return false;
	if (a.id !== b.id) return true;
	if (a.type !== b.type) return true;
	if (a.name !== b.name) return true;
	if (a.key !== b.key) return true;
	if (a.owner !== b.owner) return true;
	if (a.parent !== b.parent) return true;
	if (a.depth !== b.depth) return true;
	if (!sameIds(a.children, b.children)) return true;
	if (!sameStrings(a.hocs, b.hocs)) return true;
	return false;
}

function didVisibleStructureChange(a: DevNode, b: DevNode) {
	if (a.id !== b.id) return true;
	if (a.parent !== b.parent) return true;
	if (a.depth !== b.depth) return true;
	if (!sameIds(a.children, b.children)) return true;
	return false;
}

function sameStrings(a: string[] | null, b: string[] | null) {
	if (a === b) return true;
	if (a === null || b === null) return false;
	if (a.length !== b.length) return false;
	for (let i = 0; i < a.length; i++) {
		if (a[i] !== b[i]) return false;
	}
	return true;
}
