import { ID } from "../view/store";
import {
	Options as PreactOptions,
	VNode as PreactVNode,
	Component as PreactComponent,
	render,
	h,
} from "preact";
import { EmitterFn } from "./hook";
import { flush } from "./events";
import { createCommit, Renderer, getDisplayName } from "./renderer";
import { IdMapper } from "./IdMapper";
import { Highlighter } from "../view/components/Highlighter";
import { measureNode, getNearestElement } from "./dom";
import { setIn } from "../shells/shared/utils";

export type Effect = () => void | Cleanup;
export type Cleanup = () => void;

export interface EffectHookState {
	_value?: Effect;
	_args?: any[];
	_cleanup?: Cleanup;
	_revision?: number;
}

export interface MemoHookState {
	_value?: any;
	_args?: any[];
	_callback?: () => any;
	_revision?: number;
}

export interface ReducerHookState {
	_value?: any;
	_component?: Component;
	_revision?: number;
}

export interface ImperativeHookState {
	_args?: any[];
	_revision?: number;
}

export type HookState =
	| EffectHookState
	| MemoHookState
	| ReducerHookState
	| ImperativeHookState;

export interface ComponentHooks {
	/** The list of hooks a component uses */
	_list: HookState[];
	/** List of Effects to be invoked after the next frame is rendered */
	_pendingEffects: EffectHookState[];
	/** List of Effects to be invoked at the end of the current render */
	_pendingLayoutEffects: EffectHookState[];
}

export interface Component extends PreactComponent {
	__hooks?: ComponentHooks;
}

export interface VNode extends PreactVNode {
	old: VNode | null;
	_parent: VNode | null;
	_children: null | VNode[];
	_component: Component | null;
	_dom: HTMLElement | null;
	_lastDomChild: HTMLElement | Text | null;
}

export interface Options extends Pick<PreactOptions, "vnode" | "unmount"> {
	_commit: (vnode: VNode) => void;
	_diff: (vnode: VNode) => void;
	diffed: (vnode: VNode, oldVNode: VNode) => void;
}

export type Path = Array<string | number>;

export interface DevtoolsEvent {
	name: string;
	data: any;
}

export type UpdateType = "props" | "state" | "hooks" | "context";

export interface Adapter {
	highlight(id: ID | null): void;
	inspect(id: ID): void;
	log(id: ID): void;
	update(id: ID, type: UpdateType, path: Path, value: any): void;
	select(id: ID): void;
	onCommit(vnode: VNode): void;
	onUnmount(vnode: VNode): void;
	connect(): void;
	flushInitial(): void;
}

export interface InspectData {
	id: ID;
	name: string;
	type: any;
	context: Record<string, any> | null;
	canEditHooks: boolean;
	hooks: any | null;
	canEditProps: boolean;
	props: Record<string, any> | null;
	canEditState: boolean;
	state: Record<string, any> | null;
}

export function setupOptions(options: Options, adapter: Adapter) {
	// Store (possible) previous hooks so that we don't overwrite them
	let prevVNodeHook = options.vnode;
	let prevCommitRoot = options._commit;
	let prevBeforeUnmount = options.unmount;
	let prevBeforeDiff = options._diff;
	let prevAfterDiff = options.diffed;

	options.vnode = vnode => {
		// Tiny performance improvement by initializing fields as doubles
		// from the start. `performance.now()` will always return a double.
		// See https://github.com/facebook/react/issues/14365
		// and https://slidr.io/bmeurer/javascript-engine-fundamentals-the-good-the-bad-and-the-ugly
		vnode.startTime = NaN;
		vnode.endTime = NaN;

		vnode.startTime = 0;
		vnode.endTime = -1;
		if (prevVNodeHook) prevVNodeHook(vnode);

		(vnode as any).old = null;
	};

	options._diff = vnode => {
		vnode.startTime = performance.now();
		if (prevBeforeDiff != null) prevBeforeDiff(vnode);
	};

	options.diffed = (vnode, oldVNode) => {
		vnode.endTime = performance.now();
		// let c;
		// if (vnode != null && (c = vnode._component) != null) {
		// 	c._prevProps = oldVNode != null ? oldVNode.props : null;
		// 	c._prevContext =
		// 		oldVNode != null && oldVNode._component != null
		// 			? oldVNode._component._context
		// 			: null;

		// 	if (c.__hooks != null) {
		// 		c._prevHooksRevision = c._currentHooksRevision;
		// 		c._currentHooksRevision = c.__hooks._list.reduce(
		// 			(acc, x) => acc + x._revision,
		// 			0,
		// 		);
		// 	}
		// }
		if (prevAfterDiff) prevAfterDiff(vnode, oldVNode);
	};

	options._commit = vnode => {
		if (prevCommitRoot) prevCommitRoot(vnode);

		// These cases are already handled by `unmount`
		if (vnode == null) return;
		adapter.onCommit(vnode);
	};

	options.unmount = vnode => {
		if (prevBeforeUnmount) prevBeforeUnmount(vnode);
		adapter.onUnmount(vnode as any);
	};

	// Inject tracking into setState
	// const setState = Component.prototype.setState;
	// Component.prototype.setState = function(update, callback) {
	// 	// Duplicated in setState() but doesn't matter due to the guard.
	// 	let s =
	// 		(this._nextState !== this.state && this._nextState) ||
	// 		(this._nextState = Object.assign({}, this.state));

	// 	// Needed in order to check if state has changed after the tree has been committed:
	// 	this._prevState = Object.assign({}, s);

	// 	return setState.call(this, update, callback);
	// };

	// Teardown devtools options. Mainly used for testing
	return () => {
		options.unmount = prevBeforeUnmount;
		options._commit = prevCommitRoot;
		options.diffed = prevAfterDiff;
		options._diff = prevBeforeDiff;
		options.vnode = prevVNodeHook;
	};
}

export function createAdapter(
	emit: EmitterFn,
	ids: IdMapper,
	renderers: () => Map<ID, Renderer>,
): Adapter {
	const roots = new Set<VNode>();

	/** Flag that signals if the devtools are connected */
	let connected = false;

	/** Queue events until the extension is connected */
	let queue: DevtoolsEvent[] = [];

	/**
	 * Reference to the DOM element that we'll render the selection highlighter
	 * into. We'll cache it so that we don't unnecessarily re-create it when the
	 * hover state changes. We only destroy this elment once the user stops
	 * hovering a node in the tree.
	 */
	let highlightRef: HTMLDivElement | null = null;

	function destroyHighlight() {
		if (highlightRef) {
			document.body.removeChild(highlightRef!);
		}
		highlightRef = null;
	}

	return {
		// Receive
		inspect(id) {
			renderers().forEach(r => {
				if (r.has(id)) {
					const data = r.inspect(id);
					console.log("inspect-result", data);
					if (data !== null) {
						emit("inspect-result", data);
					}
				}
			});
		},
		log(id) {
			renderers().forEach(r => {
				if (r.has(id)) r.log(id);
			});
		},
		select(id) {
			// Unused
		},
		highlight(id) {
			if (id !== null) {
				renderers().forEach(r => {
					if (!r.has(id)) return;

					const vnode = r.getVNodeById(id)!;
					const dom = r.findDomForVNode(id);

					if (dom != null) {
						if (highlightRef == null) {
							highlightRef = document.createElement("div");
							highlightRef.id = "preact-devtools-highlighter";

							document.body.appendChild(highlightRef);
						}

						const node = getNearestElement(dom[0]!);

						render(
							h(Highlighter, {
								label: getDisplayName(vnode),
								...measureNode(node),
							}),
							highlightRef,
						);
					} else {
						destroyHighlight();
					}
				});
			} else {
				destroyHighlight();
			}
		},
		update(id, type, path, value) {
			const vnode = ids.getVNode(id);
			if (vnode !== null) {
				console.log(id, type, path, value);
				if (type === "props") {
					setIn((vnode.props as any) || {}, path.slice(), value);
				}

				if (typeof vnode.type === "function") {
					vnode._component!.forceUpdate();
				} else if (vnode._dom) {
					// vnode._dom.setAttribute()
				}
			}
		},
		flushInitial() {
			console.log("flush initial buffer", queue.map(X => X.name));
			queue.forEach(ev => emit(ev.name, ev.data));
			connected = true;
			queue = [];
		},
		// Send
		onCommit(vnode) {
			const commit = createCommit(ids, roots, vnode);
			const ev = flush(commit);
			if (!ev) return;

			if (connected) {
				emit(ev.name, ev.data);
			} else {
				queue.push(ev);
			}
		},
		onUnmount(vnode) {
			// console.log("unmount rq", vnode);
		},
		connect() {},
	};
}
