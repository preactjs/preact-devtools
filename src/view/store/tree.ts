import { signal, Signal } from "@preact/signals";
import { ID, DevNode, Tree } from "./types";

export class TreeStore {
	private nodes: Tree = new Map();
	private roots: ID[] = [];
	private collapsed = new Set<ID>();
	private visibleCounts = new Map<ID, number>();
	private nodeListeners = new Map<ID, Set<() => void>>();
	private structureListeners = new Set<() => void>();
	private nodeVersions = new Map<ID, Signal<number>>();
	private rootHidden = false;

	readonly version: Signal<number> = signal(0);
	readonly structureVersion: Signal<number> = signal(0);

	sync(tree: Tree, roots: ID[], rootHidden: boolean) {
		const prevNodes = this.nodes;
		const prevRoots = this.roots;
		const changes = this.getChanges(
			prevNodes,
			tree,
			rootHidden !== this.rootHidden || !sameIds(prevRoots, roots),
		);
		this.nodes = tree;
		this.roots = roots.slice();
		this.rootHidden = rootHidden;
		this.collapsed.forEach(id => {
			if (!this.nodes.has(id)) this.collapsed.delete(id);
		});
		if (changes.structural) {
			this.recomputeVisibleCounts();
		}
		this.bump(changes.dirty, changes.structural);
		prevNodes.forEach((_, id) => {
			if (!tree.has(id)) this.nodeVersions.delete(id);
		});
	}

	clear() {
		const dirty = Array.from(this.nodes.keys());
		this.nodes = new Map();
		this.roots = [];
		this.collapsed.clear();
		this.visibleCounts.clear();
		this.bump(dirty, true);
		this.nodeVersions.clear();
	}

	get(id: ID): DevNode | null {
		return this.nodes.get(id) || null;
	}

	getRoots(): ID[] {
		return this.roots.slice();
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

		if (collapsed) this.collapsed.add(id);
		else this.collapsed.delete(id);
		this.recomputeVisibleCounts();
		this.bump([id], true);
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
		let total = 0;
		for (let i = 0; i < this.roots.length; i++) {
			total += this.visibleCounts.get(this.roots[i]) || 0;
		}
		return total;
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
		const target = this.nodes.get(id);
		if (!target || !this.isNodeSelfVisible(target)) return -1;

		let rank = 0;
		let node = target;

		while (node.parent !== -1) {
			const parent = this.nodes.get(node.parent);
			if (!parent) break;
			if (this.collapsed.has(parent.id)) return -1;

			const idx = parent.children.indexOf(node.id);
			for (let i = 0; i < idx; i++) {
				rank += this.visibleCounts.get(parent.children[i]) || 0;
			}
			if (this.isNodeSelfVisible(parent)) rank += 1;
			node = parent;
		}

		const rootIdx = this.roots.indexOf(node.id);
		for (let i = 0; i < rootIdx; i++) {
			rank += this.visibleCounts.get(this.roots[i]) || 0;
		}

		return rank;
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
		for (let i = this.roots.length; i--; ) {
			this.computeVisibleCount(this.roots[i]);
		}
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

	private isNodeSelfVisible(node: DevNode) {
		return !(this.rootHidden && node.parent === -1);
	}

	private getChanges(prev: Tree, next: Tree, structural: boolean) {
		const dirty: ID[] = [];
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
				structural = true;
			}
		});
		return { dirty, structural };
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
