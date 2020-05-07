import { NodeTransform } from "./focusNode";

/**
 * Ensures that nodes with a width of 0 are visible.
 * This is done by applying a minimum-width and
 * padding parents by that amount.
 */
export function padNodes(
	nodes: NodeTransform[],
	factor: number,
): NodeTransform[] {
	nodes = nodes.slice();

	// Ensure that every node is visible
	const needsPad: NodeTransform[] = [];
	nodes.forEach(node => {
		if (node.width <= 0) {
			needsPad.push(node);
		}
	});

	needsPad.forEach(pad => {
		pad.width += factor;

		nodes.forEach(node => {
			// Enlarge width of parents
			if (
				node.x <= pad.x &&
				(node.x + node.width >= pad.x + pad.width ||
					(node.x + node.width > pad.x &&
						node.x + node.width < pad.x + pad.width))
			) {
				if (node.id !== pad.id) {
					node.width += factor;
				}
			} else if (node.id !== pad.id && node.x >= pad.x) {
				// Move nodes to the right by factor
				node.x += factor;
			}
		});
	});

	return nodes;
}
