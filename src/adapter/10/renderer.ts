import { BaseEvent, PortPageHook } from "../adapter/port";
import { Commit, MsgTypes, flush } from "../events/events";
import {
	VNode,
	FunctionalComponent,
	ComponentConstructor,
	Options,
} from "preact";
import { getStringId } from "../string-table";
import {
	isRoot,
	getAncestor,
	isSuspenseVNode,
	getDisplayName,
	getComponent,
	getDom,
	getActualChildren,
	getVNodeParent,
	hasDom,
	setNextState,
	getHookState,
} from "./vnode";
import { shouldFilter } from "./filter";
import { ID, DevNodeType } from "../../view/store/types";
import { traverse, setIn, SerializedVNode, setInCopy } from "./utils";
import { FilterState } from "../adapter/filter";
import { Renderer } from "../renderer";
import {
	createIdMappingState,
	getVNodeById,
	hasId,
	getVNodeId,
	hasVNodeId,
	removeVNodeId,
	IdMappingState,
	createVNodeId,
	updateVNodeId,
} from "./IdMapper";
import { logVNode } from "./renderer/logVNode";
import { inspectVNode } from "./renderer/inspectVNode";
import { getRenderReason, RenderReason } from "./renderer/renderReasons";
import {
	UpdateRects,
	measureUpdate,
	startDrawing,
} from "../adapter/highlightUpdates";
import {
	createStats,
	DiffType,
	getDiffType,
	updateDiffStats,
	recordComponentStats,
} from "./stats";
import { NodeType } from "../../constants";

export interface RendererConfig10 {
	Fragment: FunctionalComponent;
	Component?: ComponentConstructor;
}

const memoReg = /^Memo\(/;
const forwardRefReg = /^ForwardRef\(/;
/**
 * Get the type of a vnode. The devtools uses these constants to differentiate
 * between the various forms of components.
 */
export function getDevtoolsType(vnode: VNode): DevNodeType {
	if (typeof vnode.type == "function") {
		const name = vnode.type.displayName || "";
		if (memoReg.test(name)) return DevNodeType.Memo;
		if (forwardRefReg.test(name)) return DevNodeType.ForwardRef;
		if (isSuspenseVNode(vnode)) return DevNodeType.Suspense;

		// TODO: Provider and Consumer
		return vnode.type.prototype && vnode.type.prototype.render
			? DevNodeType.ClassComponent
			: DevNodeType.FunctionComponent;
	}
	return DevNodeType.Element;
}

export function isVNode(x: any): x is VNode {
	return x != null && x.type !== undefined && hasDom(x);
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

function isTextNode(dom: HTMLElement | Text | null): dom is Text {
	return dom != null && dom.nodeType === NodeType.Text;
}

function updateHighlight(profiler: ProfilerState, vnode: VNode) {
	if (profiler.highlightUpdates && typeof vnode.type === "function") {
		let dom = getDom(vnode);
		if (isTextNode(dom)) {
			dom = dom.parentNode as HTMLElement;
		}
		if (dom && !profiler.pendingHighlightUpdates.has(dom)) {
			profiler.pendingHighlightUpdates.add(dom);
			measureUpdate(profiler.updateRects, dom);
		}
	}
}

export function mount(
	ids: IdMappingState,
	commit: Commit,
	vnode: VNode,
	ancestorId: ID,
	filters: FilterState,
	domCache: WeakMap<HTMLElement | Text, VNode>,
	config: RendererConfig10,
	profiler: ProfilerState,
) {
	if (commit.stats !== null) {
		commit.stats.mounts++;
	}

	const root = isRoot(vnode, config);

	const skip = shouldFilter(vnode, filters, config);
	if (root || !skip) {
		const id = hasVNodeId(ids, vnode)
			? getVNodeId(ids, vnode)
			: createVNodeId(ids, vnode);
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

		// Capture render reason (mount here)
		if (profiler.isProfiling && profiler.captureRenderReasons) {
			commit.operations.push(MsgTypes.RENDER_REASON, id, RenderReason.MOUNT, 0);
		}

		updateHighlight(profiler, vnode);

		ancestorId = id;
	}

	if (skip && typeof vnode.type !== "function") {
		const dom = getDom(vnode);
		if (dom) domCache.set(dom, vnode);
	}

	let diff = DiffType.UNKNOWN;
	let childCount = 0;

	const children = getActualChildren(vnode);
	for (let i = 0; i < children.length; i++) {
		const child = children[i];
		if (child != null) {
			if (commit.stats !== null) {
				diff = getDiffType(child, diff);
				childCount++;
			}

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

	if (commit.stats !== null) {
		updateDiffStats(commit.stats, diff, childCount);
		recordComponentStats(config, commit.stats, vnode, children);
	}
}

export function resetChildren(
	commit: Commit,
	ids: IdMappingState,
	id: ID,
	vnode: VNode,
	filters: FilterState,
	config: RendererConfig10,
) {
	const children = getActualChildren(vnode);
	if (!children.length) return;

	const next = getFilteredChildren(vnode, filters, config);
	if (next.length < 2) return;

	commit.operations.push(
		MsgTypes.REORDER_CHILDREN,
		id,
		next.length,
		...next.map(x => getVNodeId(ids, x)),
	);
}

export function update(
	ids: IdMappingState,
	commit: Commit,
	vnode: VNode,
	ancestorId: number,
	filters: FilterState,
	domCache: WeakMap<HTMLElement | Text, VNode>,
	config: RendererConfig10,
	profiler: ProfilerState,
) {
	if (commit.stats !== null) {
		commit.stats.updates++;
	}

	let diff = DiffType.UNKNOWN;

	const skip = shouldFilter(vnode, filters, config);
	if (skip) {
		let childCount = 0;
		const children = getActualChildren(vnode);
		for (let i = 0; i < children.length; i++) {
			const child = children[i];
			if (child != null) {
				if (commit.stats !== null) {
					diff = getDiffType(child, diff);
					childCount++;
				}

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

		if (commit.stats !== null) {
			updateDiffStats(commit.stats, diff, childCount);
			recordComponentStats(config, commit.stats, vnode, children);
		}
		return;
	}

	if (!hasVNodeId(ids, vnode)) {
		mount(ids, commit, vnode, ancestorId, filters, domCache, config, profiler);
		return true;
	}

	const id = getVNodeId(ids, vnode);
	commit.operations.push(
		MsgTypes.UPDATE_VNODE_TIMINGS,
		id,
		(vnode.startTime || 0) * 1000,
		(vnode.endTime || 0) * 1000,
	);

	const oldVNode = getVNodeById(ids, id);
	updateVNodeId(ids, id, vnode);

	if (profiler.isProfiling && profiler.captureRenderReasons) {
		const reason = getRenderReason(oldVNode, vnode);
		if (reason !== null) {
			const count = reason.items ? reason.items.length : 0;
			commit.operations.push(MsgTypes.RENDER_REASON, id, reason.type, count);
			if (reason.items && count > 0) {
				commit.operations.push(
					...reason.items.map(str => getStringId(commit.strings, str)),
				);
			}
		}
	}

	updateHighlight(profiler, vnode);

	const oldChildren = oldVNode
		? getActualChildren(oldVNode).map((v: any) => v && getVNodeId(ids, v))
		: [];

	let shouldReorder = false;
	let childCount = 0;

	const children = getActualChildren(vnode);
	for (let i = 0; i < children.length; i++) {
		const child = children[i];
		if (child == null) {
			if (oldChildren[i] != null) {
				commit.unmountIds.push(oldChildren[i]);
			}
		} else if (hasVNodeId(ids, child) || shouldFilter(child, filters, config)) {
			if (commit.stats !== null) {
				diff = getDiffType(child, diff);
				childCount++;
			}
			update(ids, commit, child, id, filters, domCache, config, profiler);
			// TODO: This is only sometimes necessary
			shouldReorder = true;
		} else {
			if (commit.stats !== null) {
				diff = getDiffType(child, diff);
				childCount++;
			}
			mount(ids, commit, child, id, filters, domCache, config, profiler);
			shouldReorder = true;
		}
	}

	if (commit.stats !== null) {
		updateDiffStats(commit.stats, diff, childCount);
		recordComponentStats(config, commit.stats, vnode, children);
	}

	if (shouldReorder) {
		resetChildren(commit, ids, id, vnode, filters, config);
	}
}

export function createCommit(
	ids: IdMappingState,
	roots: Set<VNode>,
	vnode: VNode,
	filters: FilterState,
	domCache: WeakMap<HTMLElement | Text, VNode>,
	config: RendererConfig10,
	profiler: ProfilerState,
	statState: StatState,
): Commit {
	const commit = {
		operations: [],
		rootId: -1,
		strings: new Map(),
		unmountIds: [],
		renderReasons: new Map(),
		stats: statState.isRecording ? createStats() : null,
	};

	let parentId = -1;

	const isNew = !hasVNodeId(ids, vnode);

	if (isRoot(vnode, config)) {
		if (commit.stats !== null) {
			commit.stats.roots.total++;
			const children = getActualChildren(vnode);
			commit.stats.roots.children.push(children.length);
		}

		parentId = -1;
		roots.add(vnode);
	} else {
		parentId = getVNodeId(ids, getAncestor(vnode)!);
	}

	if (isNew) {
		mount(ids, commit, vnode, parentId, filters, domCache, config, profiler);
	} else {
		update(ids, commit, vnode, parentId, filters, domCache, config, profiler);
	}

	commit.rootId = getVNodeId(ids, vnode);

	return commit;
}

const DEFAULT_FIlTERS: FilterState = {
	regex: [],
	type: new Set(["dom", "fragment"]),
};

export interface Preact10Renderer extends Renderer {
	onCommit(vnode: VNode): void;
	onUnmount(vnode: VNode): void;
	updateHook(id: ID, index: number, value: any): void;
}

export interface ProfilerState {
	isProfiling: boolean;
	highlightUpdates: boolean;
	pendingHighlightUpdates: Set<HTMLElement>;
	updateRects: UpdateRects;
	captureRenderReasons: boolean;
}

export interface StatState {
	isRecording: boolean;
}

export interface Supports {
	renderReasons: boolean;
	hooks: boolean;
}

export function createRenderer(
	port: PortPageHook,
	namespace: number,
	config: RendererConfig10,
	options: Options,
	supports: Supports,
	filters: FilterState = DEFAULT_FIlTERS,
): Preact10Renderer {
	const ids = createIdMappingState(namespace);
	const roots = new Set<VNode>();

	let currentUnmounts: number[] = [];

	const domToVNode = new WeakMap<HTMLElement | Text, VNode>();

	const profiler: ProfilerState = {
		isProfiling: false,
		highlightUpdates: false,
		updateRects: new Map(),
		pendingHighlightUpdates: new Set(),
		captureRenderReasons: false,
	};

	const statState: StatState = {
		isRecording: false,
	};

	function onUnmount(vnode: VNode) {
		if (!shouldFilter(vnode, filters, config)) {
			if (hasVNodeId(ids, vnode)) {
				currentUnmounts.push(getVNodeId(ids, vnode));
			}
		}

		if (typeof vnode.type !== "function") {
			const dom = getDom(vnode);
			if (dom != null) domToVNode.delete(dom);
		}

		removeVNodeId(ids, vnode);
	}

	return {
		// TODO: Deprecate
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		flushInitial() {},

		clear() {
			roots.forEach(vnode => {
				onUnmount(vnode);
			});
		},

		startHighlightUpdates() {
			profiler.highlightUpdates = true;
		},
		stopHighlightUpdates() {
			profiler.highlightUpdates = false;
			profiler.updateRects.clear();
			profiler.pendingHighlightUpdates.clear();
		},

		startRecordStats: () => {
			statState.isRecording = true;
		},
		stopRecordStats: () => {
			statState.isRecording = false;
		},

		startProfiling: options => {
			profiler.isProfiling = true;
			profiler.captureRenderReasons =
				!!options && !!options.captureRenderReasons;
		},
		stopProfiling: () => {
			profiler.isProfiling = false;
		},
		getVNodeById: id => getVNodeById(ids, id),
		has: id => hasId(ids, id),
		getDisplayName(vnode) {
			return getDisplayName(vnode, config);
		},
		getDisplayNameById: id => {
			const vnode = getVNodeById(ids, id);
			if (vnode) {
				return getDisplayName(vnode, config);
			}
			return "Unknown";
		},
		log: (id, children) => logVNode(ids, config, id, children),
		inspect: id => inspectVNode(ids, config, options, id, supports.hooks),
		findDomForVNode(id) {
			const vnode = getVNodeById(ids, id);
			if (!vnode) return null;

			const first = getDom(vnode);
			let last = null;
			if (typeof vnode.type === "function") {
				const children = getActualChildren(vnode);
				for (let i = children.length - 1; i >= 0; i--) {
					const child = children[i];
					if (child) {
						const dom = getDom(child);
						if (dom === first) break;
						if (dom !== null) {
							last = dom;
							break;
						}
					}
				}
			}

			return [first, last];
		},
		findVNodeIdForDom(node) {
			const vnode = domToVNode.get(node);
			if (vnode) {
				if (shouldFilter(vnode, filters, config)) {
					let p: VNode | null = vnode;
					let found = null;
					while ((p = getVNodeParent(p)) != null) {
						if (!shouldFilter(p, filters, config)) {
							found = p;
							break;
						}
					}

					if (found != null) {
						return getVNodeId(ids, found) || -1;
					}
				} else {
					return getVNodeId(ids, vnode) || -1;
				}
			}

			return -1;
		},
		refresh() {
			this.applyFilters(filters);
		},
		applyFilters(nextFilters) {
			/** Queue events and flush in one go */
			const queue: BaseEvent<any, any>[] = [];

			roots.forEach(root => {
				const rootId = getVNodeId(ids, root);
				traverse(root, vnode => this.onUnmount(vnode));

				const commit: Commit = {
					operations: [],
					rootId,
					strings: new Map(),
					unmountIds: currentUnmounts,
					stats: statState.isRecording ? createStats() : null,
				};

				if (commit.stats !== null) {
					commit.stats.unmounts += commit.unmountIds.length;
				}

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
					statState,
				);
				const ev = flush(commit);
				if (!ev) return;
				queue.push(ev);
			});

			this.flushInitial();
			queue.forEach(ev => port.send(ev.type, ev.data));
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
				statState,
			);

			if (commit.stats !== null) {
				commit.stats.unmounts += currentUnmounts.length;
			}

			commit.unmountIds.push(...currentUnmounts);
			currentUnmounts = [];
			const ev = flush(commit);
			if (!ev) return;

			if (profiler.updateRects.size > 0) {
				startDrawing(profiler.updateRects);
				profiler.pendingHighlightUpdates.clear();
			}

			port.send(ev.type as any, ev.data);
		},
		onUnmount,
		update(id, type, path, value) {
			const vnode = getVNodeById(ids, id);
			if (vnode !== null) {
				if (typeof vnode.type === "function") {
					const c = getComponent(vnode);
					if (c) {
						if (type === "props") {
							vnode.props = setInCopy(
								(vnode.props as any) || {},
								path.slice(),
								value,
							);
						} else if (type === "state") {
							const res = setInCopy(
								(c.state as any) || {},
								path.slice(),
								value,
							);
							setNextState(c, res);
						} else if (type === "context") {
							// TODO: Investigate if we should disallow modifying context
							// from devtools and make it readonly.
							setIn((c.context as any) || {}, path.slice(), value);
						}

						c.forceUpdate();
					}
				}
			}
		},
		updateHook(id, index, value) {
			const vnode = getVNodeById(ids, id);
			if (vnode !== null && typeof vnode.type === "function") {
				const c = getComponent(vnode);
				if (c) {
					const s = getHookState(c, index);
					// TODO: How do we know it's okay to assign like this? Hook state varies.
					(s as any)[0] = value;
					c.forceUpdate();
				}
			}
		},
	};
}
