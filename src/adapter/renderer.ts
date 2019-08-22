import { VNode } from "./adapter";
import { Commit, MsgTypes } from "./events";
import { Fragment } from "../examples/preact.module";
import { IdMapper } from "./IdMapper";
import { ID } from "../store";
import { StringTable, getStringId } from "./string-table";

export function isRoot(vnode: VNode) {
	return vnode._parent == null && vnode.type === Fragment;
}

/**
 * Get the root of a vnode
 */
export function findRoot(vnode: VNode): VNode {
	let next: VNode | null = vnode;
	while ((next = next._parent)) {
		if (isRoot(next)) {
			return next;
		}
	}

	return vnode;
}

/**
 * Get the ancestor component that rendered the current vnode
 */
export function getAncestor(vnode: VNode) {
	let next: VNode | null = vnode;
	while ((next = next._parent)) {
		return next;
	}

	return null;
}

export enum Elements {
	HTML_ELEMENT = 1,
	CLASS_COMPONENT = 2,
	FUNCTION_COMPONENT = 3,
	FORWARD_REF = 4,
	MEMO = 5,
	SUSPENSE = 6,
}

let memoReg = /^Memo\(/;
let forwardRefReg = /^ForwardRef\(/;
/**
 * Get the type of a vnode. The devtools uses these constants to differentiate
 * between the various forms of components.
 */
export function getDevtoolsType(vnode: VNode): Elements {
	if (typeof vnode.type == "function" && vnode.type !== Fragment) {
		const name = vnode.type.displayName || "";
		if (memoReg.test(name)) return Elements.MEMO;
		if (forwardRefReg.test(name)) return Elements.FORWARD_REF;
		if (vnode._component && (vnode._component as any)._childDidSuspend)
			return Elements.SUSPENSE;
		// TODO: Provider and Consumer
		return vnode.type.prototype && vnode.type.prototype.render
			? Elements.CLASS_COMPONENT
			: Elements.FUNCTION_COMPONENT;
	}
	return Elements.HTML_ELEMENT;
}

/**
 * Get human readable name of the component/dom element
 */
export function getDisplayName(vnode: VNode) {
	if (vnode.type === Fragment) return "Fragment";
	else if (typeof vnode.type === "function")
		return vnode.type.displayName || vnode.type.name;
	else if (typeof vnode.type === "string") return vnode.type;
	return "#text";
}

export function createCommit(
	ids: IdMapper,
	roots: Set<VNode>,
	vnode: VNode,
): Commit {
	const commit = {
		operations: [],
		rootId: -1,
		strings: new Map(),
		unmountIds: [],
	};

	let parentId = -1;

	const isNew = !ids.hasId(vnode);

	if (isRoot(vnode)) {
		const rootId = ids.hasId(vnode) ? ids.getId(vnode) : ids.createId(vnode);
		parentId = commit.rootId = rootId;
		roots.add(vnode);
	} else {
		const root = findRoot(vnode);
		commit.rootId = ids.getId(root);
		parentId = ids.getId(getAncestor(vnode)!);
	}

	if (isNew) {
		mount(ids, commit, vnode, parentId);
	} else {
		console.log("UPDATE", ids.getId(vnode));
	}

	return commit;
}

export function mount(
	ids: IdMapper,
	commit: Commit,
	vnode: VNode,
	ancestorId: ID,
) {
	const id = ids.createId(vnode);
	if (isRoot(vnode)) {
		commit.operations.push(MsgTypes.ADD_ROOT, id);
	}

	commit.operations.push(
		MsgTypes.ADD_VNODE,
		id,
		getDevtoolsType(vnode), // Type
		ancestorId,
		9999, // owner
		getStringId(commit.strings, getDisplayName(vnode)),
		vnode.key ? getStringId(commit.strings, vnode.key) : 0,
	);

	const children = vnode._children || [];
	for (let i = 0; i < children.length; i++) {
		if (children[i] !== null) {
			mount(ids, commit, children[i], id);
		}
	}
}
