import { flushTable, StringTable } from "./string-table";
import { Store } from "../../view/store/types";
import { batch } from "@preact/signals-core";
import { recordProfilerCommit } from "../../view/components/profiler/data/commits";
import { ops2Tree } from "./operations";
import { applyOperationsV1 } from "./legacy/operationsV1";
import { OperationInfo, Stats, stats2ops } from "../shared/stats";
import { DevtoolEvents } from "../hook";

export enum MsgTypes {
	ADD_ROOT = 1,
	ADD_VNODE = 2, // Used by Preact 10.1.x
	REMOVE_VNODE = 3,
	UPDATE_VNODE_TIMINGS = 4, // Used by Preact 10.1.x
	REORDER_CHILDREN = 5,
	RENDER_REASON = 6,
	COMMIT_STATS = 7,
	HOC_NODES = 8,
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
//
// RENDER_REASON
//   id
//   type
//   stringsCount
//   ...stringIds
//
// COMMIT_STATS -> Check `stats.ts`
//
// HOC_NODES
//  vnodeId
//  stringsCounts
//  ...stringIds
//
export interface Commit {
	rootId: number;
	/**
	 * Mapping of portal children to original portal root. Needed
	 * because the inner tree finishes rendering before the outer
	 * one is completed.
	 * [vnodeId, portalParentId, vnodeId2, portalParentId2,...]
	 */
	reparent: number[];
	strings: StringTable;
	unmountIds: number[];
	operations: number[];
	stats: Stats | null;
}

/**
 * Collect all relevant data from a commit and convert it to a message
 * the detools can understand
 */
export function flush(commit: Commit) {
	const { rootId, unmountIds, operations, strings, stats } = commit;
	if (unmountIds.length === 0 && operations.length === 0) return;

	const msg = [rootId, ...flushTable(strings)];
	if (unmountIds.length > 0) {
		msg.push(MsgTypes.REMOVE_VNODE, unmountIds.length, ...unmountIds);
	}
	msg.push(...operations);
	if (stats !== null) {
		msg.push(...stats2ops(stats));
	}

	return { type: "operation_v2", data: msg };
}

function sumArrays(a: number[], b: number[]) {
	for (let i = 0; i < b.length; i++) {
		a[i] += b[i];
	}
}

function sumOps(a: OperationInfo, b: OperationInfo) {
	a.components += b.components;
	a.elements += b.elements;
	a.text += b.text;
}

/**
 * This is the heart of the devtools. Here we translate incoming events
 * and construct the tree data structure which all operations in the
 * Devtools UI are based upon.
 *
 * We currently expect all operations to be in order.
 */
export function applyOperationsV2(store: Store, data: number[]) {
	const {
		rootId: commitRootId,
		rendered,
		roots,
		tree,
		reasons,
		stats,
	} = ops2Tree(store.nodes.value, store.roots.value, data);

	// Update store data
	store.roots.value = roots;
	store.nodes.value = tree;

	if (store.inspectData.value) {
		const id = store.inspectData.value.id;
		if (tree.has(id)) {
			store.notify("inspect", id);
		}
	}

	// If we are profiling, we'll make a frozen copy of the mutable
	// elements tree because the profiler can step through time
	if (store.profiler.isRecording.value) {
		recordProfilerCommit(
			store.nodes.value,
			store.profiler,
			rendered,
			commitRootId,
		);
		const map = store.profiler.renderReasons.value.set(commitRootId, reasons);
		store.profiler.renderReasons.value = new Map(map);
	}

	if (stats !== null) {
		if (store.stats.data.value === null) {
			store.stats.data.value = stats;
		} else {
			const v = store.stats.data.value;
			sumArrays(v.roots, stats.roots);
			sumArrays(v.classComponents, stats.classComponents);
			sumArrays(v.functionComponents, stats.functionComponents);
			sumArrays(v.fragments, stats.fragments);
			sumArrays(v.forwardRef, stats.forwardRef);
			sumArrays(v.memo, stats.memo);
			sumArrays(v.suspense, stats.suspense);
			sumArrays(v.elements, stats.elements);
			v.text += stats.text;
			sumArrays(v.keyed, stats.keyed);
			sumArrays(v.unkeyed, stats.unkeyed);
			sumArrays(v.mixed, stats.mixed);

			sumOps(v.mounts, stats.mounts);
			sumOps(v.updates, stats.updates);
			sumOps(v.unmounts, stats.unmounts);

			const single = v.singleChildType;
			const singleNew = stats.singleChildType;

			single.roots += singleNew.roots;
			single.classComponents += singleNew.classComponents;
			single.functionComponents += singleNew.functionComponents;
			single.fragments += singleNew.fragments;
			single.forwardRef += singleNew.forwardRef;
			single.memo += singleNew.memo;
			single.suspense += singleNew.suspense;
			single.elements += singleNew.elements;

			store.stats.data.value = { ...v };
		}
	}
}

export function applyEvent(store: Store, type: keyof DevtoolEvents, data: any) {
	switch (type) {
		case "attach":
			if (!store.profiler.isSupported.value) {
				store.profiler.isSupported.value = !!data.supportsProfiling;
			}
			if (!store.profiler.supportsRenderReasons.value) {
				store.profiler.supportsRenderReasons.value = !!data.supportsRenderReasons;
			}

			if (!store.supports.hooks.value) {
				store.supports.hooks.value = !!data.supportsHooks;
			}

			if (store.profiler.highlightUpdates.value) {
				store.emit("start-highlight-updates", null);
			}
			break;
		case "operation":
			applyOperationsV1(store, data);
			break;
		case "operation_v2":
			batch(() => {
				applyOperationsV2(store, data);
			});
			break;
		case "inspect-result": {
			const { props, state, context } = store.sidebar;
			store.inspectData.value = data;

			if (store.selection.selected.value !== data.id) {
				store.selection.selectById(data.id);

				// Reset collapsible state
				props.uncollapsed.value = [];
				state.uncollapsed.value = [];
				context.uncollapsed.value = [];
			}
			break;
		}
		case "select-node":
			store.selection.selectById(data);
			break;
		case "stop-picker":
			store.isPicking.value = false;
			break;
		case "root-order": {
			const oldRoots = store.roots.value;
			const newOrder = new Set(data);

			for (let i = 0; i < oldRoots.length; i++) {
				const id = oldRoots[i];
				if (!newOrder.has(id)) {
					data.push(id);
				}
			}

			store.roots.value = data;
			break;
		}
	}
}
