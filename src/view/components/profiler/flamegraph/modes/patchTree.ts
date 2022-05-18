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
	placeNode(commit, idToTransform, commit.rootId, 0);

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

function placeNode(
	commit: CommitData,
	idToTransform: Map<ID, NodeTransform>,
	id: ID,
	depth: number,
) {
	const node = commit.nodes.get(id)!;
	if (!node) return;

	let start = 0;
	if (node.parent !== -1) {
		const parentPos = idToTransform.get(node.parent)!;
		start = parentPos.x + parentPos.width;
	}

	const selfDuration = commit.selfDurations.get(id) || 0;

	const nodePos: NodeTransform = {
		id,
		row: depth,
		x: start,
		commitParent: false,
		maximized: false,
		visible: false,
		weight: commit.rendered.has(id) ? getGradient(50, selfDuration) : -1,
		width: selfDuration,
	};
	idToTransform.set(id, nodePos);

	// Enlarge to make node visible if width == 0
	if (nodePos.width === 0) {
		enlargeParents(commit, idToTransform, id, 0.01);
	}

	for (let i = 0; i < node.children.length; i++) {
		const childId = node.children[i];

		// TODO: Handle static trees differently
		const childSelfDuration = commit.selfDurations.get(childId) || 0;

		placeNode(commit, idToTransform, childId, depth + 1);

		// Expand parents upwards by self duration
		enlargeParents(commit, idToTransform, id, childSelfDuration);
	}
}

function enlargeParents(
	commit: CommitData,
	idToTransform: Map<ID, NodeTransform>,
	id: ID,
	value: number,
) {
	let parentId = id;
	while (parentId !== -1) {
		const parent = commit.nodes.get(parentId)!;
		idToTransform.get(parentId)!.width += value;
		parentId = parent.parent;
	}
}
