import { DevtoolsHook, EmitterFn } from "./hook";
import { flushTable, StringTable } from "./string-table";

export enum MsgTypes {
	ADD_ROOT = 1,
	ADD_VNODE = 2,
	REMOVE_VNODE = 3,
	UPDATE_VNODE_TIMINGS = 4,
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
export function flush(emit: EmitterFn, commit: Commit) {
	const { rootId, unmountIds, operations, strings } = commit;
	if (unmountIds.length === 0 && operations.length === 0) return;

	let msg = [rootId, ...flushTable(strings)];
	if (unmountIds.length > 0) {
		msg.push(MsgTypes.REMOVE_VNODE, unmountIds.length, ...unmountIds);
	}
	msg.push(...operations);

	emit("operation", msg);
}
