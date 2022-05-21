import { BaseEvent, PortPageHook } from "../adapter/port";
import { Commit, flush } from "../protocol/events";
import { FunctionalComponent, ComponentConstructor, Options } from "preact";
import { ID, DevNodeType } from "../../view/store/types";
import { traverse } from "./utils";
import { FilterState } from "../adapter/filter";
import { Renderer } from "../renderer";
import { startDrawing } from "../adapter/highlightUpdates";
import { setIn, setInCopy } from "../shared/serialize";
import { createStats } from "../shared/stats";
import { ProfilerState } from "../adapter/profiler";
import {
	getVNodeById,
	getVNodeId,
	hasVNodeId,
	IdMappingState,
	removeVNodeId,
} from "../shared/idMapper";
import { createCommit, shouldFilter } from "../shared/traverse";
import { PreactBindings, SharedVNode } from "../shared/bindings";
import { inspectVNode } from "./inspectVNode";
import { logVNode } from "../10/log";
import { printCommit } from "../debug";

export interface RendererConfig {
	Fragment: FunctionalComponent;
	Component?: ComponentConstructor;
}

const memoReg = /^Memo\(/;
const forwardRefReg = /^ForwardRef\(/;
/**
 * Get the type of a vnode. The devtools uses these constants to differentiate
 * between the various forms of components.
 */
export function getDevtoolsType<T extends SharedVNode>(
	vnode: T,
	bindings: PreactBindings<T>,
): DevNodeType {
	if (bindings.isComponent(vnode)) {
		// TODO: Use getDisplayName here?
		const name = vnode.type.displayName || "";
		if (memoReg.test(name)) return DevNodeType.Memo;
		if (forwardRefReg.test(name)) return DevNodeType.ForwardRef;
		if (bindings.isSuspenseVNode(vnode)) return DevNodeType.Suspense;
		if (bindings.isPortal(vnode)) return DevNodeType.Portal;

		// TODO: Provider and Consumer
		return vnode.type.prototype && vnode.type.prototype.render
			? DevNodeType.ClassComponent
			: DevNodeType.FunctionComponent;
	}
	return DevNodeType.Element;
}

export interface Supports {
	renderReasons: boolean;
	hooks: boolean;
}

export function createRenderer<T extends SharedVNode>(
	port: PortPageHook,
	config: RendererConfig,
	options: Options,
	supports: Supports,
	profiler: ProfilerState,
	filters: FilterState,
	ids: IdMappingState<T>,
	bindings: PreactBindings<T>,
): Renderer<T> {
	const roots = new Set<T>();

	let currentUnmounts: number[] = [];

	const domToVNode = new WeakMap<HTMLElement | Text, T>();

	function onUnmount(vnode: T) {
		if (!shouldFilter(vnode, filters, config, bindings)) {
			if (hasVNodeId(ids, vnode)) {
				currentUnmounts.push(getVNodeId(ids, vnode));
			}
		}

		if (!bindings.isComponent(vnode)) {
			const dom = bindings.getDom(vnode);
			if (dom != null) domToVNode.delete(dom);
		}

		removeVNodeId(ids, vnode);
	}

	const inspect = (id: ID) => {
		return inspectVNode(ids, config, bindings, options, id, supports.hooks);
	};

	return {
		clear() {
			roots.forEach(vnode => {
				onUnmount(vnode);
			});
		},

		getVNodeById: id => getVNodeById(ids, id),
		getDisplayName(vnode) {
			return bindings.getDisplayName(vnode, config);
		},
		log: (id, children) => logVNode(ids, config, id, children),
		inspect,
		findDomForVNode(id) {
			const vnode = getVNodeById(ids, id);
			if (!vnode) return null;

			let first = null;
			let last = null;

			// Traverse tree until we find the first DOM node
			let stack: any[] = [vnode];
			let item;
			while ((item = stack.shift()) !== undefined) {
				if (item === null) continue;

				if (!bindings.isComponent(item)) {
					first = bindings.getDom(item);
					break;
				}

				stack.push(...bindings.getActualChildren(item));
			}

			// If we traversed through every child, then there is
			// no last child present.
			if (first !== null) {
				stack = [vnode];
				while ((item = stack.pop()) !== undefined) {
					if (item === null) continue;

					if (!bindings.isComponent(item)) {
						last = bindings.getDom(item);
						break;
					}

					stack.push(...bindings.getActualChildren(item));
				}
			}

			// Only set last if node is different. If both are the same
			// we assume that we cannot show correct padding, margin and
			// border visualizations and skip that.
			return [first, first === last ? null : last];
		},
		findVNodeIdForDom(node) {
			const vnode = domToVNode.get(node);
			if (vnode) {
				if (shouldFilter(vnode, filters, config, bindings)) {
					let p: T | null = vnode;
					let found = null;
					while ((p = bindings.getVNodeParent(p)) != null) {
						if (!shouldFilter(p, filters, config, bindings)) {
							found = p;
							break;
						}
					}

					if (found != null) {
						return getVNodeId(ids, found);
					}
				} else {
					return getVNodeId(ids, vnode);
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
				traverse(root, vnode => this.onUnmount(vnode), bindings);

				const commit: Commit = {
					operations: [],
					rootId,
					strings: new Map(),
					unmountIds: currentUnmounts,
					startTime: -1,
					stats: profiler.recordStats ? createStats() : null,
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
					bindings,
					{ start: new Map(), end: new Map() },
					null,
				);
				const ev = flush(commit);
				if (!ev) return;
				queue.push(ev);
			});

			queue.forEach(ev => port.send(ev.type, ev.data));
		},
		onCommit(vnode, timingsByVNode, renderReasonPre) {
			const commit = createCommit(
				ids,
				roots,
				vnode,
				filters,
				domToVNode,
				config,
				profiler,
				bindings,
				timingsByVNode,
				renderReasonPre,
			);

			timingsByVNode.start.clear();
			timingsByVNode.end.clear();

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

			printCommit(ev.data);
			port.send(ev.type as any, ev.data);
		},
		onUnmount,
		update(id, type, path, value) {
			const vnode = getVNodeById(ids, id);
			if (vnode !== null) {
				if (bindings.isComponent(vnode)) {
					const c = bindings.getComponent(vnode);
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
							bindings.setNextState(c, res);
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
			if (vnode !== null && bindings.isComponent(vnode)) {
				const c = bindings.getComponent(vnode);
				if (c) {
					const s = bindings.getHookState(vnode, index);
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
				if (bindings.isSuspenseVNode(vnode)) {
					const c = bindings.getComponent(vnode);
					if (c) {
						c.setState(bindings.createSuspenseState(vnode, active));
					}

					// Get nearest non-filtered vnode
					let nearest: T | null = vnode;
					while (nearest && shouldFilter(nearest, filters, config, bindings)) {
						nearest = bindings.getVNodeParent(nearest);
					}

					if (nearest && hasVNodeId(ids, nearest)) {
						const nearestId = getVNodeId(ids, nearest);
						if (id !== nearestId) {
							const inspectData = inspect(nearestId);
							if (inspectData) {
								inspectData.suspended = active;
								port.send("inspect-result", inspectData);
							}
						}
					}
					break;
				}

				vnode = bindings.getVNodeParent(vnode);
			}
		},
	};
}
