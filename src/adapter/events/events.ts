import { flushTable, StringTable, parseTable } from "../string-table";
import { Store, DevNode, ID } from "../../view/store/types";
import { recordProfilerCommit } from "../../view/components/profiler/data/commits";
import { patchTree } from "../../view/components/profiler/flamegraph/transform/patchTree";
import { deepClone } from "../../view/components/profiler/flamegraph/transform/util";
import { ops2Tree } from "./operations";
import { applyOperationsV1 } from "./legacy/operationsV1";

export enum MsgTypes {
	ADD_ROOT = 1,
	ADD_VNODE = 2, // Used by Preact 10.1.x
	REMOVE_VNODE = 3,
	UPDATE_VNODE_TIMINGS = 4, // Used by Preact 10.1.x
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
// ADD_VNODE_V2
//   id
//   type
//   parent
//   owner
//   name
//   key
//   startTime
//   duration
//
// REMOVE_VNODE
//   id
//
// UPDATE_VNODE_TIMINGS
//   id
//   duration
//
// UPDATE_VNODE_TIMINGS_V2
//   id
//   startTime
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

	return { name: "operation_v2", data: msg };
}

/**
 * This is the heart of the devtools. Here we translate incoming events
 * and construct the tree data structure which all operations in the
 * Devtools UI are based upon.
 *
 * We currently expect all operations to be in order.
 */
export function applyOperationsV2(store: Store, data: number[]) {
	const { rootId, removals, roots, tree } = ops2Tree(store.nodes.$, data);

	// Apply all removals
	removals.forEach(id => store.nodes.$.delete(id));

	// Combine old and new tree into a single one
	const merged = patchTree(store.nodes.$, tree, rootId);

	// Update roots if necessary
	if (roots.length > 0) {
		store.roots.update(arr => {
			arr.push(...roots);
		});
	}

	store.nodes.$ = merged;

	if (store.inspectData.$) {
		const id = store.inspectData.$.id;
		if (tree.has(id)) {
			store.actions.inspect(id);
		}
	}

	// If we are profiling, we'll make a frozen copy of the mutable
	// elements tree because the profiler can step through time
	if (store.profiler.isRecording.$) {
		recordProfilerCommit(merged, store.profiler, rootId);
	}
}

export function applyEvent(store: Store, name: string, data: any) {
	switch (name) {
		case "operation":
			applyOperationsV1(store, data);
			break;
		case "operation_v2":
			applyOperationsV2(store, data);
			break;
		case "inspect-result":
			store.inspectData.$ = data;
			if (store.selection.selected.$ !== data.id) {
				store.selection.selectById(data.id);
			}
			break;
		case "select-node":
			store.selection.selectById(data);
			break;
		case "stop-picker":
			store.actions.stopPickElement();
			break;
	}
}
