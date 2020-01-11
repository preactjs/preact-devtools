import { DevNode, ID } from "../../../../store/types";
import { adjustNodesToRight } from "./util";

export function resizeToMin(tree: Map<ID, DevNode>, min: number) {
	tree.forEach(node => {
		if (node.treeEndTime - node.treeStartTime < min) {
			let delta = min - (node.treeEndTime - node.treeStartTime);
			node.treeEndTime += delta;

			adjustNodesToRight(tree, node.id, delta);
		}
	});
}
