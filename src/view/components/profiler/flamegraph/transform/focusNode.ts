import { ID } from "../../../../store/types";
import { deepClone } from "./util";

export interface NodeTransform {
	id: ID;
	x: number;
	row: number;
	width: number;
	weight: number;
	maximized: boolean;
	visible: boolean;
	commitParent: boolean;
}

/**
 * Focus a particular node by maximizing it. All parents
 * will be maximized too.
 */
export function focusNode(nodes: NodeTransform[], id: ID) {
	nodes = deepClone(nodes);

	// Populate caches
	const byId = new Map<ID, NodeTransform>();
	nodes.forEach(node => byId.set(node.id, node));

	// Bail out if the focused node is not available
	const target = byId.get(id);
	if (!target) {
		return nodes;
	}

	// Sort nodes by `row` and `x` coordinate
	nodes.sort((a, b) => {
		const res = a.row - b.row;
		return res === 0 ? a.x - b.x : res;
	});

	// Separate nodes by row
	const rows: NodeTransform[][] = [];

	// list of parents of the focused node
	const parents: NodeTransform[] = [];

	nodes.forEach(node => {
		if (!rows[node.row]) {
			rows[node.row] = [];
		}

		if (
			target.row >= node.row &&
			target.x >= node.x &&
			target.x + target.width <= node.x + node.width
		) {
			node.maximized = true;
			parents.push(node);
		} else {
			node.maximized = false;
		}

		rows[node.row].push(node);
	});

	// Assumes that there is a single root node for
	// each flamegraph
	const maxWidth = nodes[0].width;

	// Scale factor of the row that's focused
	let scale = 1;

	// x-axis offset for the current row
	let offset = 0;

	// Focus each row to the parent or target node
	rows.forEach((row, i) => {
		// Get scale factor for the current row.
		// We'll keep using the one of the row with
		// the focused node, for all succeeding rows.
		const maximized = i < parents.length ? parents[i] : null;
		if (maximized !== null) {
			scale = maxWidth / maximized.width;
			offset = maximized.x;
		}

		// Apply offset + scale factor to each node of the current row
		row.forEach(node => {
			node.x = (node.x - offset) * scale;
			node.width = node.width * scale;
		});
	});

	return nodes;
}
