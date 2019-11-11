import { InspectData, DevtoolsEvent } from "../adapter/adapter";
import { Commit, MsgTypes, flush } from "../events";
import { Fragment, VNode } from "preact";
import { IdMapper, createIdMapper } from "./IdMapper";
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
	getVNodeParent,
} from "./vnode";
import { FilterState, shouldFilter } from "./filter";
import { ID } from "../../view/store/types";
import { cleanContext, jsonify, cleanProps, traverse } from "../renderer-utils";

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

export function isVNode(x: any): x is VNode {
	return x != null && x.type !== undefined && getDom(x) !== undefined;
}

export interface Renderer {
	getVNodeById(id: ID): VNode | null;
	findDomForVNode(id: ID): Array<HTMLElement | Text | null> | null;
	findVNodeIdForDom(node: HTMLElement | Text): number;
	applyFilters(filters: FilterState): void;
	has(id: ID): boolean;
	log(id: ID, children: ID[]): void;
	inspect(id: ID): InspectData | null;
	onCommit(vnode: VNode): void;
	onUnmount(vnode: VNode): void;
	flushInitial(): void;
	forceUpdate(id: ID): void;
}

let DEFAULT_FIlTERS: FilterState = {
	regex: [],
	type: new Set(["dom", "fragment"]),
};

export function createRenderer(
	hook: DevtoolsHook,
	filters: FilterState = DEFAULT_FIlTERS,
): Renderer {
	const ids = createIdMapper();
	const roots = new Set<VNode>();

	/** Queue events until the extension is connected */
	let queue: DevtoolsEvent[] = [];

	let currentUnmounts: number[] = [];

	let domToVNode = new WeakMap<HTMLElement | Text, VNode>();

	return {
		getVNodeById: id => ids.getVNode(id),
		has: id => ids.has(id),
		forceUpdate: id => {
			const vnode = ids.getVNode(id);
			if (vnode) {
				const c = getComponent(vnode);
				if (c) c.forceUpdate();
			}
		},
		log(id, children) {
			const vnode = ids.getVNode(id);
			if (vnode == null) {
				console.warn(`Could not find vnode with id ${id}`);
				return;
			}
			logVNode(vnode, id, children);
		},
		inspect(id) {
			const vnode = ids.getVNode(id);
			if (!vnode) return null;

			const c = getComponent(vnode);
			const hasState =
				typeof vnode.type === "function" &&
				c != null &&
				Object.keys(c.state).length > 0;

			const hasHooks = c != null && getComponentHooks(c) != null;
			const context = c != null ? cleanContext(c.context) : null;

			return {
				context,
				canEditHooks: hasHooks,
				hooks: null,
				id,
				name: getDisplayName(vnode),
				canEditProps: true,
				props:
					vnode.type !== null
						? jsonify(cleanProps(vnode.props), isVNode)
						: null,
				canEditState: true,
				state: hasState ? jsonify(c!.state, isVNode) : null,
				type: 2,
			};
		},
		findDomForVNode(id) {
			const vnode = ids.getVNode(id);
			return vnode ? [getDom(vnode), getLastDomChild(vnode)] : null;
		},
		findVNodeIdForDom(node) {
			const vnode = domToVNode.get(node);
			if (vnode) {
				if (shouldFilter(vnode, filters)) {
					let p = vnode;
					while ((p = getVNodeParent(p)) != null) {
						if (!shouldFilter(p, filters)) break;
					}

					if (p != null) {
						return ids.getId(p) || -1;
					}
				} else {
					return ids.getId(vnode) || -1;
				}
			}

			return -1;
		},
		applyFilters(nextFilters) {
			roots.forEach(root => {
				const children = getActualChildren(root);
				if (children.length > 0 && children[0] != null) {
					traverse(children[0], vnode => this.onUnmount(vnode));
				}

				const commit: Commit = {
					operations: [],
					rootId: ids.getId(root),
					strings: new Map(),
					unmountIds: currentUnmounts,
				};

				const unmounts = flush(commit);
				if (unmounts) {
					currentUnmounts = [];
					queue.push(unmounts);
				}
			});

			filters.regex = nextFilters.regex;
			filters.type = nextFilters.type;

			roots.forEach(root => {
				const commit = createCommit(ids, roots, root, filters, domToVNode);
				const ev = flush(commit);
				if (!ev) return;
				queue.push(ev);
			});

			if (hook.connected) {
				this.flushInitial();
			}
		},
		flushInitial() {
			queue.forEach(ev => hook.emit(ev.name, ev.data));
			hook.connected = true;
			queue = [];
		},
		onCommit(vnode) {
			const commit = createCommit(ids, roots, vnode, filters, domToVNode);
			commit.unmountIds.push(...currentUnmounts);
			currentUnmounts = [];
			const ev = flush(commit);
			if (!ev) return;

			if (hook.connected) {
				hook.emit(ev.name, ev.data);
			} else {
				queue.push(ev);
			}
		},
		onUnmount(vnode) {
			if (!shouldFilter(vnode, filters)) {
				if (ids.hasId(vnode)) {
					currentUnmounts.push(ids.getId(vnode));
				}
			} else if (typeof vnode.type !== "function") {
				const dom = getDom(vnode);
				if (dom != null) domToVNode.delete(dom);
			}

			ids.remove(vnode);
		},
	};
}

/**
 * Print an element to console
 */
export function logVNode(vnode: VNode, id: ID, children: ID[]) {
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
	console.log("devtools children:", children);
	console.groupEnd();
	/* eslint-enable no-console */
}

export function createCommit(
	ids: IdMapper,
	roots: Set<VNode>,
	vnode: VNode,
	filters: FilterState,
	domCache: WeakMap<HTMLElement | Text, VNode>,
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
		mount(ids, commit, vnode, parentId, filters, domCache);
	} else {
		update(ids, commit, vnode, parentId, filters, domCache);
	}

	return commit;
}

export function mount(
	ids: IdMapper,
	commit: Commit,
	vnode: VNode,
	ancestorId: ID,
	filters: FilterState,
	domCache: WeakMap<HTMLElement | Text, VNode>,
) {
	const root = isRoot(vnode);

	const skip = shouldFilter(vnode, filters);
	if (root || !skip) {
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

	if (skip && typeof vnode.type !== "function") {
		const dom = getDom(vnode);
		if (dom) domCache.set(dom, vnode);
	}

	const children = getActualChildren(vnode);
	for (let i = 0; i < children.length; i++) {
		if (children[i] !== null) {
			mount(ids, commit, children[i], ancestorId, filters, domCache);
		}
	}
}

export function update(
	ids: IdMapper,
	commit: Commit,
	vnode: VNode,
	ancestorId: number,
	filters: FilterState,
	domCache: WeakMap<HTMLElement | Text, VNode>,
) {
	const skip = shouldFilter(vnode, filters);
	if (skip) {
		const children = getActualChildren(vnode);
		for (let i = 0; i < children.length; i++) {
			if (children[i] != null) {
				update(ids, commit, children[i], ancestorId, filters, domCache);
			}
		}
		return;
	}

	if (!ids.hasId(vnode)) {
		mount(ids, commit, vnode, ancestorId, filters, domCache);
		return true;
	}

	const id = ids.getId(vnode);
	commit.operations.push(
		MsgTypes.UPDATE_VNODE_TIMINGS,
		id,
		(vnode.endTime || 0) - (vnode.startTime || 0),
	);

	const oldVNode = ids.getVNode(id);
	ids.update(id, vnode);

	const oldChildren = oldVNode
		? getActualChildren(oldVNode).map((v: any) => v && ids.getId(v))
		: [];

	let shouldReorder = false;

	const children = getActualChildren(vnode);
	for (let i = 0; i < children.length; i++) {
		const child = children[i];
		if (child == null) {
			if (oldChildren[i] != null) {
				commit.unmountIds.push(oldChildren[i]);
			}
		} else if (ids.hasId(child) || shouldFilter(child, filters)) {
			update(ids, commit, child, id, filters, domCache);
			// TODO: This is only sometimes necessary
			shouldReorder = true;
		} else {
			mount(ids, commit, child, id, filters, domCache);
			shouldReorder = true;
		}
	}

	if (shouldReorder) {
		resetChildren(commit, ids, id, vnode, filters);
	}
}

export function resetChildren(
	commit: Commit,
	ids: IdMapper,
	id: ID,
	vnode: VNode,
	filters: FilterState,
) {
	let children = getActualChildren(vnode);
	if (!children.length) return;

	let next = getFilteredChildren(vnode, filters);
	if (next.length < 2) return;

	commit.operations.push(
		MsgTypes.REORDER_CHILDREN,
		id,
		next.length,
		...next.map(x => ids.getId(x)),
	);
}

export function getFilteredChildren(
	vnode: VNode,
	filters: FilterState,
): VNode[] {
	const children = getActualChildren(vnode);
	const stack = children.slice();

	const out: VNode[] = [];

	let child;
	while (stack.length) {
		child = stack.pop();
		if (child != null) {
			if (!shouldFilter(child, filters)) {
				out.push(child);
			} else {
				const nextChildren = getActualChildren(child);
				if (nextChildren.length > 0) {
					stack.push(...nextChildren.slice());
				}
			}
		}
	}

	return out.reverse();
}
