import { ID, DevNode } from "../../../../store/types";
import { FlameNodeTransform } from "./flamegraph-utils";
import { getGradient } from "../../data/gradient";
import { CommitData } from "../../data/commits";
import { NodeTransform } from "../shared";

export type FlameTree = Map<ID, FlameNodeTransform>;

/**
 * Place commit tree. When a node's children are bigger than it's parent,
 * the parent and all next siblings will be expanded (pushed) to the right.
 */
export function patchTree(commit: CommitData) {
	const { nodes, commitRootId } = commit;

	const idToTransform = new Map<ID, NodeTransform>();
	placeNode(commit, idToTransform, commit.rootId);

	let direct: DevNode | undefined = nodes.get(commitRootId);
	if (direct !== undefined) {
		while ((direct = nodes.get(direct.parent))) {
			const transform = idToTransform.get(direct.id);
			if (transform) {
				transform.commitParent = true;
			}
		}
	}

	return idToTransform;
}

export function getSelfDuration(commit: CommitData, node: DevNode) {
	const duration = node.endTime - node.startTime;
	const children = node.children.reduce((acc, childId) => {
		const child = commit.nodes.get(childId);
		if (!child) return 0;

		return acc + (child.endTime - child.startTime);
	}, 0);

	const selfDuration = duration - children;
	return selfDuration <= 0 ? 0 : selfDuration;
}

function placeNode(
	commit: CommitData,
	idToTransform: Map<ID, NodeTransform>,
	id: ID,
) {
	const node = commit.nodes.get(id)!;
	if (!node) return;

	let start = 0;
	if (node.parent !== -1) {
		const parentPos = idToTransform.get(node.parent)!;
		start = parentPos.x + parentPos.width;
	}

	const selfDuration = getSelfDuration(commit, node);

	const nodePos: NodeTransform = {
		id,
		row: node.depth,
		x: start,
		commitParent: false,
		maximized: false,
		visible: false,
		weight: commit.selfDurations.has(id) ? getGradient(50, selfDuration) : -1,
		width: selfDuration,
	};
	idToTransform.set(id, nodePos);

	for (let i = 0; i < node.children.length; i++) {
		const childId = node.children[i];
		const child = commit.nodes.get(childId);
		if (!child) continue;

		const selfDuration = getSelfDuration(commit, child);

		placeNode(commit, idToTransform, childId);

		// Expand parents upwards by self duration
		let parentId = id;
		while (parentId !== -1) {
			const parent = commit.nodes.get(parentId)!;
			idToTransform.get(parentId)!.width += selfDuration;
			parentId = parent.parent;
		}
	}
}
