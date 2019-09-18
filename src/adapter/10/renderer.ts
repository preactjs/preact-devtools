import { InspectData, DevtoolsEvent } from "../adapter";
import { Commit, MsgTypes, jsonify, cleanProps, flush } from "../events";
import { Fragment, VNode } from "preact";
import { IdMapper, createIdMapper } from "./IdMapper";
import { ID } from "../../view/store";
import { getStringId } from "../string-table";
import { DevtoolsHook } from "../hook";
import {
	isRoot,
	findRoot,
	getAncestor,
	isSuspenseVNode,
	getDisplayName,
	getComponent,
	getComponentHooks,
	getDom,
	getLastDomChild,
	getActualChildren,
} from "./vnode";
import { FilterState, shouldFilter } from "./filter";

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
		if (isSuspenseVNode(vnode)) return Elements.SUSPENSE;

		// TODO: Provider and Consumer
		return vnode.type.prototype && vnode.type.prototype.render
			? Elements.CLASS_COMPONENT
			: Elements.FUNCTION_COMPONENT;
	}
	return Elements.HTML_ELEMENT;
}

export interface Renderer {
	getVNodeById(id: ID): VNode | null;
	findDomForVNode(id: ID): Array<HTMLElement | Text | null> | null;
	findVNodeIdForDom(node: HTMLElement | Text): number;
	applyFilters(filters: FilterState): void;
	has(id: ID): boolean;
	log(id: ID): void;
	inspect(id: ID): InspectData | null;
	onCommit(vnode: VNode): void;
	onUnmount(vnode: VNode): void;
	flushInitial(): void;
}

export function createRenderer(hook: DevtoolsHook): Renderer {
	const ids = createIdMapper();
	const roots = new Set<VNode>();

	/** Queue events until the extension is connected */
	let queue: DevtoolsEvent[] = [];

	/** Currently active filters */
	let filters: FilterState = {
		regex: [],
		type: new Set(),
	};

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
			const c = getComponent(vnode);
			const hasHooks = c != null && getComponentHooks(c) != null;

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
					hasState && Object.keys(c!.state).length > 0
						? jsonify(c!.state)
						: null,
				type: 2,
			};
		},
		findDomForVNode(id) {
			const vnode = ids.getVNode(id);
			return vnode ? [getDom(vnode), getLastDomChild(vnode)] : null;
		},
		findVNodeIdForDom(node) {
			return ids.getByDom(node) || -1;
		},
		applyFilters(nextFilters) {
			filters.regex = nextFilters.regex;
			filters.type = nextFilters.type;
		},
		flushInitial() {
			console.log(queue);
			queue.forEach(ev => hook.emit(ev.name, ev.data));
			hook.connected = true;
			queue = [];
		},
		onCommit(vnode) {
			const commit = createCommit(ids, roots, vnode, filters);
			const ev = flush(commit);
			if (!ev) return;

			if (hook.connected) {
				hook.emit(ev.name, ev.data);
			} else {
				queue.push(ev);
			}
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
	const c = getComponent(vnode);
	if (c != null) {
		console.log("state:", c.state);
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
	filters: FilterState,
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
		const rootId = !isNew ? ids.getId(vnode) : ids.createId(vnode);
		parentId = commit.rootId = rootId;
		roots.add(vnode);
	} else {
		const root = findRoot(vnode);
		commit.rootId = ids.getId(root);
		parentId = ids.getId(getAncestor(vnode)!);
	}

	if (isNew) {
		mount(ids, commit, vnode, parentId, filters);
	} else {
		update(ids, commit, vnode, filters);
	}

	return commit;
}

export function mount(
	ids: IdMapper,
	commit: Commit,
	vnode: VNode,
	ancestorId: ID,
	filters: FilterState,
) {
	const root = isRoot(vnode);

	if (root || !shouldFilter(vnode, filters)) {
		const id = ids.hasId(vnode) ? ids.getId(vnode) : ids.createId(vnode);
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
		ancestorId = id;
	}

	const children = getActualChildren(vnode);
	for (let i = 0; i < children.length; i++) {
		if (children[i] !== null) {
			mount(ids, commit, children[i], ancestorId, filters);
		}
	}
}

export function update(
	ids: IdMapper,
	commit: Commit,
	vnode: VNode,
	filters: FilterState,
) {
	const id = ids.getId(vnode);
	commit.operations.push(
		MsgTypes.UPDATE_VNODE_TIMINGS,
		id,
		(vnode.endTime || 0) - (vnode.startTime || 0),
	);

	const children = getActualChildren(vnode);
	for (let i = 0; i < children; i++) {
		if (ids.hasId(vnode)) {
			update(ids, commit, vnode, filters);
		} else {
			mount(ids, commit, vnode, id, filters);
		}
	}
	return commit;
}
