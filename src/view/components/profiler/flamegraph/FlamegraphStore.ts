import { watch } from "../../../valoo";
import { ProfilerState, FlamegraphType, ProfilerNode } from "../data/commits";
import { getGradient } from "../data/gradient";
import { ID, Tree } from "../../../store/types";
import { layoutRanked } from "./modes/ranked";
import { layoutTimeline } from "./modes/flamegraph";
import { focusNode, NodeTransform } from "./transform/focusNode";
import { padNodes } from "./transform/pad";
import { deepClone } from "./transform/util";

/**
 * The minimum width of a node inside the flamegraph.
 * This ensures that the user doesn't miss any nodes
 * that would be smaller than <1px because of zooming
 */
export const MIN_WIDTH = 6;

/**
 * Height of each row of the flamegraph. All items have
 * a fixed height.
 */
export const ROW_HEIGHT = 20;

export function createFlameGraphStore(profiler: ProfilerState) {
	const layoutNodes = watch(() => {
		const commit = profiler.activeCommit.$;
		const current = profiler.selectedNode.$;

		if (commit === null) {
			return [];
		}

		const items = flattenNodeTree(commit.nodes, commit.rootId);

		const viewMode = profiler.flamegraphType.$;
		let nodes: NodeTransform[] = [];
		if (viewMode === FlamegraphType.RANKED) {
			const root = commit.nodes.get(commit.commitRootId)!;
			nodes = layoutRanked(
				items.filter(node => {
					return (
						node.startTime >= root.startTime && node.endTime <= root.endTime
					);
				}),
			);
		} else if (viewMode === FlamegraphType.FLAMEGRAPH) {
			nodes = layoutTimeline(items);

			// Normalize timeline if it has an offset
			const offset = nodes.length > 0 ? nodes[0].x : 0;
			nodes = nodes.map(node => {
				return { ...node, x: node.x - offset };
			});
		}

		nodes = padNodes(nodes, 0.1);

		if (nodes.length > 0) {
			nodes = focusNode(nodes, current === null ? nodes[0].id : current.id);
		}

		return nodes;
	});

	const colors = watch(() => {
		const state = new Map<ID, number>();
		const commit = profiler.activeCommit.$;
		if (commit !== null) {
			const root = commit.commitRootId;

			const children = flattenNodeTree(commit.nodes, root);
			children.forEach(child => {
				state.set(
					child.id,
					getGradient(commit.maxSelfDuration, child.selfDuration || 1),
				);
			});
		}

		return state;
	});

	return {
		nodes: layoutNodes,
		colors,
	};
}

export function getRoot(tree: Tree, id: ID) {
	let item = tree.get(id);
	let last = id;
	while (item !== undefined) {
		last = item.id;
		item = tree.get(item.parent);
	}

	return last;
}

export function flattenNodeTree<K, T extends { id: K; children: K[] }>(
	tree: Map<K, T>,
	id: K,
): T[] {
	const out: T[] = [];
	const visited = new Set<K>();
	let stack: K[] = [id];

	while (stack.length > 0) {
		const item = stack.pop();
		if (item == null) continue;

		const node = tree.get(item);
		if (!node) continue;

		if (!visited.has(node.id)) {
			out.push(node);
			visited.add(node.id);

			for (let i = node.children.length; i--; ) {
				stack.push(node.children[i]);
			}
		}
	}

	return out;
}

export const normalize = (max: number, min: number, x: number) => {
	return (x - min) / (max - min);
};

export function sortTimeline(a: ProfilerNode, b: ProfilerNode) {
	const time = a.startTime - b.startTime;
	// Use depth as fallback if startTime is equal
	return time === 0 ? a.depth - b.depth : time;
}
