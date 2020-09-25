import { PortPageHook } from "../adapter/port";
import {
	VNode,
	FunctionalComponent,
	ComponentConstructor,
	Options,
} from "preact";
import {
	isSuspenseVNode,
	getDisplayName,
	getComponent,
	getDom,
	getActualChildren,
	getVNodeParent,
	hasDom,
	setNextState,
	getHookState,
	createSuspenseState,
	isRoot,
} from "./vnode";
import { shouldFilter } from "./filter";
import { ID, DevNodeType } from "../../view/store/types";
import { setIn, SerializedVNode, setInCopy } from "./utils";
import { FilterState } from "../adapter/filter";
import { Renderer } from "../renderer";
import {
	createIdMappingState,
	getVNodeById,
	getVNodeId,
	hasVNodeId,
	removeVNodeId,
	createVNodeId,
} from "./IdMapper";
import { logVNode } from "./renderer/logVNode";
import { inspectVNode } from "./renderer/inspectVNode";
import { UpdateRects } from "../adapter/highlightUpdates";
import { recordComponentStats } from "./stats";
import { createReconciler } from "../reconciler";
import { DevtoolsHook } from "../hook";

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

const DEFAULT_FIlTERS: FilterState = {
	regex: [],
	// TODO: Add default hoc-filter
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
	const domToVNode = new WeakMap<HTMLElement | Text, VNode>();

	const reconciler = createReconciler<VNode>({
		isRoot(vnode) {
			return isRoot(vnode, config);
		},
		inspect(id: ID) {
			return inspectVNode(ids, config, options, id, supports.hooks);
		},
		getKey(vnode) {
			return vnode.key || null;
		},
		getDisplayName(vnode) {
			return getDisplayName(vnode, config);
		},
		getStartTime(vnode) {
			return vnode.startTime || 0;
		},
		getEndTime(vnode) {
			return vnode.endTime || 0;
		},
		onViewSource(id) {
			const vnode = getVNodeById(ids, id);
			const hook: DevtoolsHook = (window as any).__PREACT_DEVTOOLS__;

			if (vnode && typeof vnode.type === "function") {
				const { type } = vnode;
				hook.$type =
					type && type.prototype && type.prototype.render
						? type.prototype.render
						: type;
			} else {
				hook.$type = null;
			}
		},
		getChildren(vnode) {
			return getActualChildren(vnode);
		},
		log(id, devtoolsChildren) {
			logVNode(ids, config, id, devtoolsChildren);
		},
		shouldFilter(vnode, filters) {
			return shouldFilter(vnode, filters, config);
		},
		shouldForceReorder(vnode) {
			// Suspense internals mutate child outside of the standard render cycle.
			// This leads to stale children on the devtools ends. To work around that
			// We'll always reset the children of a Suspense vnode.
			return isSuspenseVNode(vnode);
		},
		hasId(vnode) {
			return hasVNodeId(ids, vnode);
		},
		getId(vnode) {
			return getVNodeId(ids, vnode);
		},
		createId(vnode) {
			return createVNodeId(ids, vnode);
		},
		removeId(vnode) {
			if (typeof vnode.type !== "function") {
				const dom = getDom(vnode);
				if (dom != null) domToVNode.delete(dom);
			}
			return removeVNodeId(ids, vnode);
		},
		recordStats(stats, vnode, children) {
			return recordComponentStats(config, stats, vnode, children);
		},
		getType(vnode) {
			return getDevtoolsType(vnode);
		},
		getAncestor() {},
		highlightUpdate() {},
		updateId() {},
		updateElementCache(vnode) {
			if (typeof vnode.type !== "function") {
				const dom = getDom(vnode);
				if (dom) domToVNode.set(dom, vnode);
			}
		},
	});

	return {
		...reconciler,
		has(id) {
			return getVNodeById(ids, id) !== null;
		},
		getVNodeById: id => getVNodeById(ids, id),
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
					// Only useState and useReducer hooks marked as editable so state can
					// cast to more specific ReducerHookState value.
					(s as [any, any])[0] = value;
					c.forceUpdate();
				}
			}
		},

		suspend(id, active) {
			let vnode = getVNodeById(ids, id);
			while (vnode !== null) {
				if (isSuspenseVNode(vnode)) {
					const c = getComponent(vnode);
					if (c) {
						c.setState(createSuspenseState(vnode, active));
					}

					// Get nearest non-filtered vnode
					let nearest: VNode | null = vnode;
					while (nearest && shouldFilter(nearest, filters, config)) {
						nearest = getVNodeParent(nearest);
					}

					if (nearest && hasVNodeId(ids, nearest)) {
						const nearestId = getVNodeId(ids, nearest);
						if (id !== nearestId) {
							const inspectData = reconciler.inspect(nearestId);
							if (inspectData) {
								inspectData.suspended = active;
								port.send("inspect-result", inspectData);
							}
						}
					}
					break;
				}

				vnode = getVNodeParent(vnode);
			}
		},
	};
}
