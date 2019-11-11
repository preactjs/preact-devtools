import { flushTable, StringTable, parseTable } from "./string-table";
import { valoo } from "../view/valoo";
import { Store } from "../view/store/types";
import { toSnapshot, parseCommitMessage } from "./debug";

export enum MsgTypes {
	ADD_ROOT = 1,
	ADD_VNODE = 2,
	REMOVE_VNODE = 3,
	UPDATE_VNODE_TIMINGS = 4,
	REORDER_CHILDREN = 5,
}

// Event Examples:
//
// ADD_ROOT
//   id
//
// ADD_VNODE
//   id
//   type
//   parent
//   owner
//   name
//   key
//
// REMOVE_VNODE
//   id
//
// UPDATE_VNODE_TIMINGS
//   id
//   duration
//
// REORDER_CHILDREN
//   id
//   childrenCount
//   childId
//   childId
//   ...

export interface Commit {
	rootId: number;
	strings: StringTable;
	unmountIds: number[];
	operations: number[];
}

/**
 * Collect all relevant data from a commit and convert it to a message
 * the detools can understand
 */
export function flush(commit: Commit) {
	const { rootId, unmountIds, operations, strings } = commit;
	if (unmountIds.length === 0 && operations.length === 0) return;

	let msg = [rootId, ...flushTable(strings)];
	if (unmountIds.length > 0) {
		msg.push(MsgTypes.REMOVE_VNODE, unmountIds.length, ...unmountIds);
	}
	msg.push(...operations);

	return { name: "operation", data: msg };
}

// FIXME: Write tests for this function
export function applyOperations(store: Store, data: number[]) {
	const rootId = data[0];

	let i = data[1] + 1;
	const strings = parseTable(data.slice(1, i + 1));

	for (; i < data.length; i++) {
		switch (data[i]) {
			case MsgTypes.ADD_ROOT:
				const id = data[i + 1];
				store.roots.$.push(id);
				i += 1;
				break;
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

					let parent = store.nodes.$.get(parentId)!;
					const depth = parent ? parent.depth + 1 : 1;

					store.nodes.$.set(id, {
						children: [],
						depth,
						id,
						name,
						parent: parentId,
						type,
						key,
						duration: valoo<number>(0),
					});
				}
				i += 6;
				break;
			}
			case MsgTypes.UPDATE_VNODE_TIMINGS: {
				const id = data[i + 1];
				const duration = data[i + 2];

				const node = store.nodes.$.get(id)!;
				if (node) {
					node.duration.$ = duration;
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

	// TODO: This triggers rendering twice :S
	store.roots.update();
	store.nodes.update();
}

export function applyEvent(store: Store, name: string, data: any) {
	switch (name) {
		case "operation":
			return applyOperations(store, data);
		case "inspect-result":
			return (store.inspectData.$ = data);
		case "select-node":
			return store.selection.selectById(data);
		case "stop-picker":
			return store.actions.stopPickElement();
	}
}
