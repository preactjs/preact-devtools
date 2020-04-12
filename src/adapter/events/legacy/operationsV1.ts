import { MsgTypes } from "../events";
import { parseTable } from "../../string-table";
import { Store } from "../../../view/store/types";

export function applyOperationsV1(store: Store, data: number[]) {
	let i = data[1] + 1;
	const strings = parseTable(data.slice(1, i + 1));

	const inspected = store.inspectData.$ != null ? store.inspectData.$.id : -2;

	for (; i < data.length; i++) {
		switch (data[i]) {
			case MsgTypes.ADD_ROOT: {
				const id = data[i + 1];
				store.roots.$.push(id);
				i += 1;
				break;
			}
			case MsgTypes.ADD_VNODE: {
				const id = data[i + 1];
				const type = data[i + 2];
				const name = strings[data[i + 5] - 1];
				const key = data[i + 6] > 0 ? strings[data[i + 6] - 1] : "";
				let parentId = data[i + 3];

				if (!store.nodes.$.has(id)) {
					// Roots have their own id as parentId
					if (id !== parentId) {
						const parent = store.nodes.$.get(parentId);
						if (!parent) {
							// throw new Error(`Parent node ${parentId} not found in store.`);
							console.warn(`Parent node ${parentId} not found in store.`);
							parentId = -1;
						} else {
							parent.children.push(id);
						}
					}

					const parent = store.nodes.$.get(parentId)!;
					const depth = parent ? parent.depth + 1 : 1;

					store.nodes.$.set(id, {
						children: [],
						depth,
						id,
						name,
						parent: parentId,
						type,
						key,
						startTime: -1,
						endTime: -1,
						treeStartTime: -1,
						treeEndTime: -1,
					});
				}
				i += 6;
				break;
			}
			case MsgTypes.UPDATE_VNODE_TIMINGS: {
				// Unused event
				const id = data[i + 1];

				if (id === inspected) {
					store.notify("inspect", id);
				}

				i += 2;
				break;
			}
			case MsgTypes.REMOVE_VNODE: {
				const unmounts = data[i + 1];
				i += 2;
				const len = i + unmounts;
				for (; i < len; i++) {
					const nodeId = data[i];
					const node = store.nodes.$.get(nodeId);
					if (node) {
						// Remove node from parent children array
						const parentId = node.parent;
						const parent = store.nodes.$.get(parentId);
						if (parent) {
							const idx = parent.children.indexOf(nodeId);
							if (idx > -1) parent.children.splice(idx, 1);
						}

						const stack = node.children;
						while (stack.length > 0) {
							const childId = stack.pop();
							if (childId != null) {
								const childNode = store.nodes.$.get(childId);
								if (childNode) {
									stack.push(...childNode.children);
									store.nodes.$.delete(childId);
								}
							}
						}

						// Remove node from store
						store.nodes.$.delete(nodeId);
					}
				}

				// Subtract one because of outer loop
				if (len > 0) i--;
				break;
			}
			case MsgTypes.REORDER_CHILDREN: {
				const parentId = data[i + 1];
				const count = data[i + 2];
				const parent = store.nodes.$.get(parentId);
				if (parent) {
					parent.children = data.slice(i + 3, i + 3 + count);
				}
				i = i + 3 + count;
				break;
			}
		}
	}

	store.roots.update();
	store.nodes.update();
}
