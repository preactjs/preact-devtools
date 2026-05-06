import { signal, Signal } from "@preact/signals";
import { ID, DevNode, Tree } from "./types";

export class TreeStore {
	private nodes: Tree = new Map();
	private roots: ID[] = [];
	private collapsed = new Set<ID>();
	private visibleCounts = new Map<ID, number>();
	private rootHidden = false;

	readonly version: Signal<number> = signal(0);

	sync(tree: Tree, roots: ID[], rootHidden: boolean) {
		this.nodes = tree;
		this.roots = roots.slice();
		this.rootHidden = rootHidden;
		this.collapsed.forEach(id => {
			if (!this.nodes.has(id)) this.collapsed.delete(id);
		});
		this.recomputeVisibleCounts();
		this.bump();
	}

	clear() {
		this.nodes = new Map();
		this.roots = [];
		this.collapsed.clear();
		this.visibleCounts.clear();
		this.bump();
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
		this.bump();
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
		this.bump();
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

		for (let i = from; i < to; i++) {
			const id = this.visibleAt(i);
			if (id !== null) out.push(id);
		}

		return out;
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

	private bump() {
		this.version.value++;
	}
}
