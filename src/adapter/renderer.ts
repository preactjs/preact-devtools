import { VNode, InspectData, Adapter } from "./adapter";
import { Commit, MsgTypes, jsonify, cleanProps } from "./events";
import { Fragment } from "preact";
import { IdMapper, createIdMapper } from "./IdMapper";
import { ID } from "../view/store";
import { getStringId } from "./string-table";

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

export interface Renderer {
	getVNodeById(id: ID): VNode | null;
	findDomForVNode(id: ID): Array<HTMLElement | Text | null> | null;
	has(id: ID): boolean;
	log(id: ID): void;
	inspect(id: ID): InspectData | null;
	onCommit(vnode: VNode): void;
	onUnmount(vnode: VNode): void;
}

export function createRenderer(adapter: Adapter): Renderer {
	const ids = createIdMapper();
	const roots = new Set<VNode>();

	return {
		getVNodeById: id => ids.getVNode(id),
		has: id => ids.has(id),
		log(id) {
			const vnode = ids.getVNode(id);
			if (vnode == null) {
				console.warn(`Could not find vnode with id ${id}`);
				return;
			}
			logVNode(vnode, id);
		},
		inspect(id) {
			const vnode = ids.getVNode(id);
			if (!vnode) return null;

			const hasState =
				typeof vnode.type === "function" && vnode.type !== Fragment;
			const hasHooks =
				vnode._component != null && vnode._component.__hooks != null;

			return {
				context: null,
				canEditHooks: hasHooks,
				hooks: null,
				id,
				name: getDisplayName(vnode),
				canEditProps: true,
				props: vnode.type !== null ? jsonify(cleanProps(vnode.props)) : null,
				canEditState: false,
				state:
					hasState && Object.keys(vnode._component!.state).length > 0
						? jsonify(vnode._component!.state)
						: null,
				type: 2,
			};
		},
		findDomForVNode(id) {
			const vnode = ids.getVNode(id);
			return vnode ? [vnode._dom, vnode._lastDomChild] : null;
		},
		onCommit(vnode) {
			const commit = createCommit(ids, roots, vnode);
			adapter.flushCommit(commit);
		},
		onUnmount(vnode) {
			console.log("TODO: Unmount vnode");
		},
	};
}

/**
 * Print an element to console
 */
export function logVNode(vnode: VNode, id: ID) {
	const display = getDisplayName(vnode);
	const name = display === "#text" ? display : `<${display || "Component"} />`;

	/* eslint-disable no-console */
	console.group(`LOG %c${name}`, "color: #ea88fd; font-weight: normal");
	console.log("props:", vnode.props);
	if (vnode._component) {
		console.log("state:", vnode._component.state);
	}
	console.log("vnode:", vnode);
	console.log("devtools id:", id);
	console.groupEnd();
	/* eslint-enable no-console */
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
