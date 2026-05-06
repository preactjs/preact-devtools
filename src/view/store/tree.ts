import { signal, Signal } from "@preact/signals";
import { ID, DevNode, Tree } from "./types";

export interface TreeSyncChanges {
	dirty: ID[];
	removed?: ID[];
	addedSubtreeRoots?: ID[];
	removedSubtreeRoots?: Array<{ id: ID; parent: ID }>;
	structural: boolean;
	incremental?: boolean;
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
		const rootHiddenChanged = rootHidden !== this.rootHidden;
		const structural = rootHiddenChanged || rootsChanged;
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
			if (nextChanges.incremental === true && rootHiddenChanged === false) {
				this.applyIncrementalVisibleChanges(nextChanges);
			} else {
				this.recomputeVisibleCounts();
			}
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
		const delta = value ? -1 : 1;
		this.rootHidden = value;
		for (let i = 0; i < this.roots.length; i++) {
			const id = this.roots[i];
			const node = this.nodes.get(id);
			if (!node) continue;

			const count = this.visibleCounts.get(id);
			if (count !== undefined) {
				this.visibleCounts.set(id, count + delta);
			}
			this.visibleTotal += delta;
		}
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

	removeIds(removeIds: Set<ID>, dirty: ID[] = Array.from(removeIds)) {
		if (removeIds.size === 0) return;

		const previous = this.nodes;
		const next = new Map(previous);
		removeIds.forEach(id => next.delete(id));

		next.forEach(node => {
			let changed = false;
			const children: ID[] = [];
			for (let i = 0; i < node.children.length; i++) {
				const child = node.children[i];
				if (removeIds.has(child)) {
					changed = true;
				} else {
					children.push(child);
				}
			}
			if (changed) {
				dirty.push(node.id);
				next.set(node.id, { ...node, children });
			}
		});

		const roots: ID[] = [];
		for (let i = 0; i < this.roots.length; i++) {
			const root = this.roots[i];
			if (!removeIds.has(root)) roots.push(root);
		}

		this.sync(next, roots, this.rootHidden, {
			dirty,
			removed: Array.from(removeIds),
			structural: true,
		});
	}

	setRootOrder(roots: ID[]) {
		this.sync(this.nodes, roots, this.rootHidden, {
			dirty: [],
			structural: true,
		});
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
		let current: DevNode | undefined = node;
		while (current) {
			if (this.isNodeSelfVisible(current)) {
				if (index === 0) return current.id;
				index--;
			}
			if (this.collapsed.has(current.id)) return null;

			let next: DevNode | undefined;
			for (let i = 0; i < current.children.length; i++) {
				const child = this.nodes.get(current.children[i]);
				if (!child) continue;

				const visibleCount = this.visibleCounts.get(child.id) || 0;
				if (index >= visibleCount) {
					index -= visibleCount;
					continue;
				}

				next = child;
				break;
			}
			current = next;
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
		const stack: Array<{ id: ID; childIndex: number; selfDone: boolean }> = [
			{ id, childIndex: 0, selfDone: false },
		];
		while (stack.length > 0 && index < to) {
			const frame = stack[stack.length - 1];
			const node = this.nodes.get(frame.id);
			if (!node) {
				stack.pop();
				continue;
			}

			if (!frame.selfDone) {
				frame.selfDone = true;
				if (this.isNodeSelfVisible(node)) {
					if (index >= from && index < to) out.push(node.id);
					index++;
					if (index >= to) break;
				}
				if (this.collapsed.has(node.id)) {
					stack.pop();
					continue;
				}
			}

			let pushed = false;
			while (frame.childIndex < node.children.length && index < to) {
				const childId = node.children[frame.childIndex++];
				const count = this.visibleCounts.get(childId) || 0;
				if (index + count <= from) {
					index += count;
					continue;
				}
				stack.push({ id: childId, childIndex: 0, selfDone: false });
				pushed = true;
				break;
			}
			if (!pushed) stack.pop();
		}

		return index;
	}

	private forEachVisibleNode(
		id: ID,
		fn: (id: ID, node: DevNode) => void | false,
	): void | false {
		const stack = [id];
		while (stack.length > 0) {
			const node = this.nodes.get(stack.pop()!);
			if (!node) continue;

			if (this.isNodeSelfVisible(node) && fn(node.id, node) === false) {
				return false;
			}
			if (this.collapsed.has(node.id)) continue;

			for (let i = node.children.length; i--; ) {
				stack.push(node.children[i]);
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

	private applyIncrementalVisibleChanges(changes: TreeSyncChanges) {
		if (changes.removedSubtreeRoots) {
			for (let i = 0; i < changes.removedSubtreeRoots.length; i++) {
				const item = changes.removedSubtreeRoots[i];
				const count = this.visibleCounts.get(item.id) || 0;
				if (count > 0 && this.isChildPathVisible(item.parent)) {
					this.visibleTotal -= count;
					this.updateAncestorVisibleCounts(item.parent, -count);
				}
			}
		}

		if (changes.removed) {
			for (let i = 0; i < changes.removed.length; i++) {
				this.visibleCounts.delete(changes.removed[i]);
			}
		}

		if (changes.addedSubtreeRoots) {
			for (let i = 0; i < changes.addedSubtreeRoots.length; i++) {
				const id = changes.addedSubtreeRoots[i];
				const node = this.nodes.get(id);
				if (!node) continue;

				const count = this.computeVisibleCount(id);
				if (count > 0 && this.isChildPathVisible(node.parent)) {
					this.visibleTotal += count;
					this.updateAncestorVisibleCounts(node.parent, count);
				}
			}
		}
	}

	private computeVisibleCount(id: ID): number {
		let total = 0;
		const stack: Array<{ id: ID; visited: boolean }> = [{ id, visited: false }];
		while (stack.length > 0) {
			const frame = stack.pop()!;
			const node = this.nodes.get(frame.id);
			if (!node) continue;

			if (frame.visited) {
				let count = this.isNodeSelfVisible(node) ? 1 : 0;
				if (!this.collapsed.has(node.id)) {
					for (let i = 0; i < node.children.length; i++) {
						count += this.visibleCounts.get(node.children[i]) || 0;
					}
				}
				this.visibleCounts.set(node.id, count);
				if (node.id === id) total = count;
				continue;
			}

			stack.push({ id: node.id, visited: true });
			if (!this.collapsed.has(node.id)) {
				for (let i = node.children.length; i--; ) {
					stack.push({ id: node.children[i], visited: false });
				}
			}
		}

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

	private isChildPathVisible(parent: ID) {
		if (parent === -1) return true;
		if (this.collapsed.has(parent)) return false;

		let id = parent;
		while (id !== -1) {
			if (this.collapsed.has(id)) return false;
			const node = this.nodes.get(id);
			if (!node) return false;
			id = node.parent;
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
