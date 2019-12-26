import { valoo, watch } from "../../../valoo";
import { ProfilerState, FlamegraphType } from "../../../store/commits";
import { getGradient } from "../data/gradient";

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
	const canvasWidth = valoo(0);

	const nodes = watch(() => {
		const commit = profiler.activeCommit.$;
		const current = profiler.selectedNode.$;

		if (commit === null || !current) {
			return [];
		}
		const root = commit.nodes.get(commit.rootId)!;
		const commitRoot = commit.nodes.get(commit.commitRootId)!;

		const viewMode = profiler.flamegraphType.$;
		const isRanked = viewMode === FlamegraphType.RANKED;

		const items = flattenNodeTree(commit.nodes, commit.rootId);

		if (isRanked) {
			items.sort((a, b) => b.selfDuration - a.selfDuration);

			items.forEach(x => {
				if (x.startTime < commit.nodes.get(commit.commitRootId)!.startTime) {
					console.log("OLD", x.name);
				}
			});
		}

		const totalDuration = isRanked ? commit.maxSelfDuration : commit.duration;
		const currentIdx = items.findIndex(x => x.id === current.id);

		return items.map((node, i) => {
			let x = 0;
			let y = 0;
			let width = 0;

			// Root nodes + nodes that include and preceed
			// the current selection, span over the full width
			const isFull = isRanked ? i < currentIdx : current.depth >= node.depth;

			// Ranked view mode
			if (isRanked) {
				// The x coordinate is always 0 and because all
				// nodes are ordered from top to bottom.
				x = 0;
				y = i * ROW_HEIGHT + node.depth;
				width = isFull ? totalDuration : node.selfDuration;
			} else {
				// Timeline view mode
				if (!isFull) {
					// Check if it's outside of the canvas
					if (node.startTime > current.startTime) {
						x = width;
					} else if (
						node.startTime < current.startTime &&
						node.startTime + node.duration < current.startTime
					) {
						x = -(node.startTime - node.duration);
					}
				} else {
					// Calculate new start time by subtracting maximized node's start time
					const newStart =
						node.startTime - (current !== null ? current.startTime : 0);

					x = newStart;
				}
			}

			// Ensure that even small components are visible
			width = Math.max(MIN_WIDTH, width);

			return {
				id: node.id,
				x,
				y,
				width,
				color:
					node.startTime > commitRoot.startTime
						? getGradient(node.selfDuration / totalDuration)
						: "var(--color-profiler-old)",
			};
		});
	});

	return {
		canvasWidth,
		nodes,
	};
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
