import { ID } from "../../../store/types";
import { CommitData, FlamegraphType, ProfilerNode } from "../data/commits";
import { watch, Observable } from "../../../valoo";
import { layoutTimeline } from "./modes/flamegraph";
import { layoutRanked } from "./modes/ranked";
import { focusNode } from "./transform/focusNode";
import { padNodes } from "./transform/pad";

/**
 * Flatten profiler node tree into a flat list
 */
export function flattenNodeTree<K, T extends { id: K; children: K[] }>(
	tree: Map<K, T>,
	id: K,
): T[] {
	const out: T[] = [];
	const visited = new Set<K>();
	const stack: K[] = [id];

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

const EMPTY: ProfilerNode = {
	children: [],
	depth: 0,
	duration: 0,
	endTime: 0,
	id: -1,
	key: "",
	name: "",
	parent: -1,
	selfDuration: 0,
	startTime: 0,
	treeEndTime: 0,
	treeStartTime: 0,
	type: 0,
};

/**
 * The minimum width of a node inside the flamegraph.
 * This ensures that the user doesn't miss any nodes
 * that would be smaller than <1px because of zooming
 */
export const MIN_WIDTH = 6;

/**
 * This function is responsible for creating the diagram layout
 * for the profiler. It's divided into steps so that we can reuse
 * as much as possible from the previous calculations on each user
 * action.
 * @param commit Commit data
 * @param viewMode The diagram mode "flamegraph" | "ranked"
 * @param selectedId The currently selected id
 * @param canvasWidth The width of the canvas
 */
export function placeNodes(
	commit: Observable<CommitData | null>,
	viewMode: Observable<FlamegraphType>,
	selectedId: Observable<ID>,
	canvasWidth: Observable<number>,
) {
	const sorted = watch(() => {
		if (!commit.$) return [];

		// 1. Preparation
		const nodes = flattenNodeTree(commit.$.nodes, commit.$.rootId);
		const root = commit.$.nodes.get(commit.$.commitRootId) || EMPTY;
		const maxDuration = commit.$.maxSelfDuration;

		const selected = commit.$.nodes.get(selectedId.$) || root;

		// 2. Sorting (view mode) + coloring
		const prepared =
			viewMode.$ === FlamegraphType.FLAMEGRAPH
				? layoutTimeline(nodes, root, selected, maxDuration)
				: layoutRanked(nodes, root, maxDuration);

		return padNodes(prepared, 0.1);
	});

	// 3. Focus
	const focused = watch(() => {
		return focusNode(sorted.$, selectedId.$);
	});

	// 4. Resize to available canvas space
	const resized = watch(() => {
		if (!focused.$.length) return [];

		const scale = (canvasWidth.$ || 1) / focused.$[0].width;

		const out = focused.$.map(node => {
			const x = node.x * scale;
			const width = node.width * scale;
			const visible =
				node.maximized ||
				(x >= 0 && x <= canvasWidth.$) ||
				(x + width >= 0 && x + width <= canvasWidth.$);
			return { ...node, x, width, visible };
		});

		// 5. Pad min-width
		return padNodes(out, MIN_WIDTH);
	});

	return resized;
}
