import { ID } from "../view/store";
import {
	Component as PreactComponent,
	render,
	h,
	Options,
	VNode,
} from "preact";
import { DevtoolsHook } from "./hook";
import { Renderer } from "./10/renderer";
import { Highlighter } from "../view/components/Highlighter";
import { measureNode, getNearestElement } from "./dom";
import { setIn } from "../shells/shared/utils";
import { getComponent, getDom, getDisplayName } from "./10/vnode";

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

export function setupOptions(options: Options, renderer: Renderer) {
	const o = options as any;

	// Store (possible) previous hooks so that we don't overwrite them
	let prevVNodeHook = options.vnode;
	let prevCommitRoot = o._commit || o.__c;
	let prevBeforeUnmount = options.unmount;
	let prevBeforeDiff = o._diff || o.__b;
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

	o._diff = o.__b = (vnode: VNode) => {
		vnode.startTime = performance.now();
		if (prevBeforeDiff != null) prevBeforeDiff(vnode);
	};

	options.diffed = vnode => {
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
		if (prevAfterDiff) prevAfterDiff(vnode);
	};

	o._commit = o.__c = (vnode: VNode | null) => {
		if (prevCommitRoot) prevCommitRoot(vnode);

		// These cases are already handled by `unmount`
		if (vnode == null) return;
		renderer.onCommit(vnode);
	};

	options.unmount = vnode => {
		if (prevBeforeUnmount) prevBeforeUnmount(vnode);
		renderer.onUnmount(vnode as any);
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
		o._commit = o.__c = prevCommitRoot;
		options.diffed = prevAfterDiff;
		o._diff = o.__b = prevBeforeDiff;
		options.vnode = prevVNodeHook;
	};
}

export function createAdapter(hook: DevtoolsHook, renderer: Renderer): Adapter {
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
		inspect(id) {
			if (renderer.has(id)) {
				const data = renderer.inspect(id);
				console.log("inspect-result", data);
				if (data !== null) {
					hook.emit("inspect-result", data);
				}
			}
		},
		log(id) {
			if (renderer.has(id)) renderer.log(id);
		},
		select(id) {
			// Unused
		},
		highlight(id) {
			if (id !== null) {
				const vnode = renderer.getVNodeById(id);
				if (!vnode) return destroyHighlight();
				const dom = renderer.findDomForVNode(id);

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
			}
		},
		update(id, type, path, value) {
			const vnode = renderer.getVNodeById(id);
			if (vnode !== null) {
				console.log(id, type, path, value);
				if (type === "props") {
					setIn((vnode.props as any) || {}, path.slice(), value);
				}

				const dom = getDom(vnode);
				if (typeof vnode.type === "function") {
					const c = getComponent(vnode);
					if (c) c.forceUpdate();
				} else if (dom) {
					// dom.setAttribute()
				}
			}
		},
	};
}
