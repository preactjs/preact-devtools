import { DevtoolsEvent } from "../adapter/adapter";
import { Commit, MsgTypes, flush } from "../events/events";
import { Fragment, VNode, FunctionalComponent } from "preact";
import { IdMapper, createIdMapper } from "./IdMapper";
import { getStringId } from "../string-table";
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
import { shouldFilter } from "./filter";
import { ID } from "../../view/store/types";
import {
	cleanContext,
	jsonify,
	cleanProps,
	traverse,
	setIn,
	SerializedVNode,
} from "./utils";
import { FilterState } from "../adapter/filter";
import { Renderer, Elements } from "../renderer";
import {
	createProfilerBackend,
	ProfilerBackend,
	recordProfilingData,
} from "./profiler";

export interface RendererConfig10 {
	Fragment: FunctionalComponent;
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

export function serializeVNode(
	x: any,
	config: RendererConfig10,
): SerializedVNode | null {
	if (isVNode(x)) {
		return {
			type: "vnode",
			name: getDisplayName(x, config),
		};
	}

	return null;
}

let DEFAULT_FIlTERS: FilterState = {
	regex: [],
	type: new Set(["dom", "fragment"]),
};

export interface Preact10Renderer extends Renderer {
	onCommit(vnode: VNode): void;
	onUnmount(vnode: VNode): void;
}

export function createRenderer(
	hook: {
		connected: boolean;
		emit: (name: string, value: any) => void;
	},
	config: RendererConfig10,
	filters: FilterState = DEFAULT_FIlTERS,
): Preact10Renderer {
	const ids = createIdMapper();
	const roots = new Set<VNode>();

	/** Queue events until the extension is connected */
	let queue: DevtoolsEvent[] = [];

	let currentUnmounts: number[] = [];

	let domToVNode = new WeakMap<HTMLElement | Text, VNode>();

	const profiler = createProfilerBackend();

	return {
		startProfiling: profiler.startProfiling,
		stopProfiling: profiler.stopProfiling,
		getVNodeById: id => ids.getVNode(id),
		has: id => ids.has(id),
		getDisplayName(vnode) {
			return getDisplayName(vnode, config);
		},
		getDisplayNameById: id => {
			const vnode = ids.getVNode(id);
			if (vnode) {
				return getDisplayName(vnode, config);
			}
			return "Unknown";
		},
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
			logVNode(vnode, id, children, config);
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
			const context =
				c != null
					? jsonify(cleanContext(c.context), node =>
							serializeVNode(node, config),
					  )
					: null;

			return {
				context,
				canEditHooks: hasHooks,
				hooks: null,
				id,
				name: getDisplayName(vnode, config),
				canEditProps: true,
				props:
					vnode.type !== null
						? jsonify(cleanProps(vnode.props), node =>
								serializeVNode(node, config),
						  )
						: null,
				canEditState: true,
				state: hasState
					? jsonify(c!.state, node => serializeVNode(node, config))
					: null,
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
				if (shouldFilter(vnode, filters, config)) {
					let p = vnode;
					while ((p = getVNodeParent(p)) != null) {
						if (!shouldFilter(p, filters, config)) break;
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
				const commit = createCommit(
					ids,
					roots,
					root,
					filters,
					domToVNode,
					config,
					profiler,
				);
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
			const commit = createCommit(
				ids,
				roots,
				vnode,
				filters,
				domToVNode,
				config,
				profiler,
			);
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
			if (!shouldFilter(vnode, filters, config)) {
				if (ids.hasId(vnode)) {
					currentUnmounts.push(ids.getId(vnode));
				}
			} else if (typeof vnode.type !== "function") {
				const dom = getDom(vnode);
				if (dom != null) domToVNode.delete(dom);
			}

			ids.remove(vnode);
		},
		update(id, type, path, value) {
			const vnode = ids.getVNode(id);
			if (vnode !== null) {
				if (typeof vnode.type === "function") {
					const c = getComponent(vnode);
					if (c) {
						if (type === "props") {
							setIn((vnode.props as any) || {}, path.slice(), value);
						} else if (type === "state") {
							setIn((c.state as any) || {}, path.slice(), value);
						} else if (type === "context") {
							setIn((c.context as any) || {}, path.slice(), value);
						}

						c.forceUpdate();
					}
				}
			}
		},
	};
}

/**
 * Print an element to console
 */
export function logVNode(
	vnode: VNode,
	id: ID,
	children: ID[],
	config: RendererConfig10,
) {
	const display = getDisplayName(vnode, config);
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
	config: RendererConfig10,
	profiler: ProfilerBackend,
): Commit {
	const commit = {
		operations: [],
		rootId: -1,
		strings: new Map(),
		unmountIds: [],
	};

	let parentId = -1;

	const isNew = !ids.hasId(vnode);

	if (isRoot(vnode, config)) {
		parentId = -1;
		roots.add(vnode);
	} else {
		parentId = ids.getId(getAncestor(vnode)!);
	}

	if (profiler.isRecording) {
		profiler.addNewCommit(commit.rootId);
	}

	if (isNew) {
		mount(ids, commit, vnode, parentId, filters, domCache, config, profiler);
	} else {
		update(ids, commit, vnode, parentId, filters, domCache, config, profiler);
	}

	commit.rootId = ids.getId(vnode);

	return commit;
}

export function mount(
	ids: IdMapper,
	commit: Commit,
	vnode: VNode,
	ancestorId: ID,
	filters: FilterState,
	domCache: WeakMap<HTMLElement | Text, VNode>,
	config: RendererConfig10,
	profiler: ProfilerBackend,
) {
	const root = isRoot(vnode, config);

	const skip = shouldFilter(vnode, filters, config);
	if (root || !skip) {
		const id = ids.hasId(vnode) ? ids.getId(vnode) : ids.createId(vnode);
		if (isRoot(vnode, config)) {
			commit.operations.push(MsgTypes.ADD_ROOT, id);
		}

		commit.operations.push(
			MsgTypes.ADD_VNODE,
			id,
			getDevtoolsType(vnode), // Type
			ancestorId,
			9999, // owner
			getStringId(commit.strings, getDisplayName(vnode, config)),
			vnode.key ? getStringId(commit.strings, vnode.key) : 0,
			// Multiply, because operations array only supports integers
			// and would otherwise cut off floats
			(vnode.startTime || 0) * 1000,
			(vnode.endTime || 0) * 1000,
		);

		ancestorId = id;
	}

	if (skip && typeof vnode.type !== "function") {
		const dom = getDom(vnode);
		if (dom) domCache.set(dom, vnode);
	}

	const children = getActualChildren(vnode);
	for (let i = 0; i < children.length; i++) {
		const child = children[i];
		if (child != null) {
			mount(
				ids,
				commit,
				child,
				ancestorId,
				filters,
				domCache,
				config,
				profiler,
			);
		}
	}

	if (profiler.isRecording) {
		recordProfilingData(ancestorId, vnode, profiler);
	}
}

export function update(
	ids: IdMapper,
	commit: Commit,
	vnode: VNode,
	ancestorId: number,
	filters: FilterState,
	domCache: WeakMap<HTMLElement | Text, VNode>,
	config: RendererConfig10,
	profiler: ProfilerBackend,
) {
	const skip = shouldFilter(vnode, filters, config);
	if (skip) {
		const children = getActualChildren(vnode);
		for (let i = 0; i < children.length; i++) {
			const child = children[i];
			if (child != null) {
				update(
					ids,
					commit,
					child,
					ancestorId,
					filters,
					domCache,
					config,
					profiler,
				);
			}
		}
		return;
	}

	if (!ids.hasId(vnode)) {
		mount(ids, commit, vnode, ancestorId, filters, domCache, config, profiler);
		return true;
	}

	const id = ids.getId(vnode);
	commit.operations.push(
		MsgTypes.UPDATE_VNODE_TIMINGS,
		id,
		(vnode.startTime || 0) * 1000,
		(vnode.endTime || 0) * 1000,
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
		} else if (ids.hasId(child) || shouldFilter(child, filters, config)) {
			update(ids, commit, child, id, filters, domCache, config, profiler);
			// TODO: This is only sometimes necessary
			shouldReorder = true;
		} else {
			mount(ids, commit, child, id, filters, domCache, config, profiler);
			shouldReorder = true;
		}
	}

	if (shouldReorder) {
		resetChildren(commit, ids, id, vnode, filters, config);
	}
}

export function resetChildren(
	commit: Commit,
	ids: IdMapper,
	id: ID,
	vnode: VNode,
	filters: FilterState,
	config: RendererConfig10,
) {
	let children = getActualChildren(vnode);
	if (!children.length) return;

	let next = getFilteredChildren(vnode, filters, config);
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
	config: RendererConfig10,
): VNode[] {
	const children = getActualChildren(vnode);
	const stack = children.slice();

	const out: VNode[] = [];

	let child;
	while (stack.length) {
		child = stack.pop();
		if (child != null) {
			if (!shouldFilter(child, filters, config)) {
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
