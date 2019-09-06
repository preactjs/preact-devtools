import { flushTable, StringTable, parseTable } from "./string-table";
import { Store, ID } from "../view/store";
import { valoo } from "../view/valoo";
import { VNode } from "preact";
import { getDisplayName } from "./10/vnode";

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

export function applyOperations(store: Store, data: number[]) {
	const rootId = data[0];

	let i = data[1] + 1;
	const strings = parseTable(data.slice(1, i + 1));

	let newRoot = false;

	for (; i < data.length; i++) {
		switch (data[i]) {
			case MsgTypes.ADD_ROOT:
				const id = data[i++];
				newRoot = true;
				store.roots(store.roots()).push(id);
				break;
			case MsgTypes.ADD_VNODE: {
				const id = data[i + 1];
				const type = data[i + 2];
				const name = strings[data[i + 5] - 1];
				const key = data[i + 6] > 0 ? ` key="${strings[i + 6 - 1]}" ` : "";
				let parentId = data[i + 3];

				if (newRoot) {
					newRoot = false;
					store.rootToChild().set(rootId, id);
					store.rootToChild(store.rootToChild());
				}

				if (store.nodes().has(id)) {
					throw new Error(`Node ${id} already present in store.`);
				}

				if (store.roots().indexOf(parentId) === -1) {
					const parent = store.nodes().get(parentId);
					if (!parent) {
						// throw new Error(`Parent node ${parentId} not found in store.`);
						console.warn(`Parent node ${parentId} not found in store.`);
						parentId = -1;
					} else {
						parent.children.push(id);
					}
				}

				store.nodes().set(id, {
					children: [],
					depth: getDepth(store, parentId),
					id,
					name,
					parentId,
					type,
					key,
					selected: valoo<boolean>(false),
				});
				i += 6;
				break;
			}
			case MsgTypes.REMOVE_VNODE: {
				const unmounts = data[i + 1];
				i += 2;
				const len = i + unmounts;
				console.log(`total unmounts: ${unmounts}`);
				for (; i < len; i++) {
					console.log(`  Remove: %c${data[i]}`, "color: red");
				}
			}
		}
	}
	store.nodes(store.nodes());
}

export function applyEvent(store: Store, name: string, data: any) {
	switch (name) {
		case "operation":
			return applyOperations(store, data);
		case "inspect-result":
			return store.inspectData(data);
	}
}

export function getDepth(store: Store, id: ID) {
	let parent = store.nodes().get(id)!;
	return parent ? parent.depth + 1 : 0;
}

export function jsonify(data: any) {
	if (isVNode(data)) {
		return {
			type: "vnode",
			name: getDisplayName(data as any),
		};
	}
	switch (typeof data) {
		case "string":
			return data.length > 300 ? data.slice(300) : data;
		case "function": {
			return {
				type: "function",
				name: data.displayName || data.name,
			};
		}
		case "object":
			if (data == null) return null;
			const out = { ...data };
			Object.keys(out).forEach(key => {
				out[key] = jsonify(out[key]);
			});
			return out;
		default:
			return data;
	}
}

export function cleanProps(props: any) {
	if (typeof props === "string" || !props) return null;
	const out = { ...props };
	delete out.children;
	if (!Object.keys(out).length) return null;
	console.log("props", out, props);
	return out;
}

export function isVNode(x: any): x is VNode {
	return x != null && x.type !== undefined && x._dom !== undefined;
}
