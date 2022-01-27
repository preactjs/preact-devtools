import { Preact11Renderer, RendererConfig11 } from "./renderer";
import { recordMark, endMark } from "../marks";
import {
	getDisplayName,
	setNextState,
	getNextState,
	getStatefulHooks,
	getStatefulHookValue,
	getComponent,
	Internal,
} from "./internal";
// import { addHookStack, addDebugValue, addHookName } from "./renderer/hooks";
// import { HookType } from "../../constants";

export interface VNode {
	foo: any;
}

export interface OptionsV11 {
	/** Attach a hook that is invoked immediately before a vnode is unmounted. */
	unmount?(internal: Internal): void;
	/** Attach a hook that is invoked after a vnode has rendered. */
	diffed?(internal: Internal): void;
	/** Attach a hook that is invoked before render, mainly to check the arguments. */
	_root?(
		vnode: ComponentChild,
		parent: Element | Document | ShadowRoot | DocumentFragment,
	): void;
	/** Attach a hook that is invoked before a vnode is diffed. */
	_diff?(internal: Internal, vnode?: VNode): void;
	/** Attach a hook that is invoked after a tree was mounted or was updated. */
	_commit?(internal: Internal, commitQueue: CommitQueue): void;
	/** Attach a hook that is invoked before a vnode has rendered. */
	_render?(internal: Internal): void;
	/** Attach a hook that is invoked before a hook's state is queried. */
	_hook?(component: Component, index: number, type: HookType): void;
	/** Bypass effect execution. Currenty only used in devtools for hooks inspection */
	_skipEffects?: boolean;
	/** Attach a hook that is invoked after an error is caught in a component but before calling lifecycle hooks */
	_catchError?(error: any, internal: Internal): void;
	_internal?(internal: Internal, vnode: VNode | string): void;
}

/**
 * Inject tracking into setState
 */
function trackPrevState(Ctor: any) {
	const setState = Ctor.prototype.setState;
	Ctor.prototype.setState = function (update: any, callback: any) {
		// Duplicated in setState() but doesn't matter due to the guard.
		const nextState = getNextState(this);
		const s =
			(nextState !== this.state && nextState) ||
			setNextState(this, Object.assign({}, this.state));

		// Needed in order to check if state has changed after the tree has been committed:
		this._prevState = Object.assign({}, s);

		return setState.call(this, update, callback);
	};
}

export function setupOptionsV11(
	options: OptionsV11,
	renderer: Preact11Renderer,
	config: RendererConfig11,
) {
	// Track component state. Only supported in Preact > 10.4.0
	if (config.Component) {
		trackPrevState(config.Component);
	}

	const o = options as any;

	// Store (possible) previous hooks so that we don't overwrite them
	const prevVNodeHook = options._internal;
	const prevCommitRoot = o._commit || o.__c;
	const prevBeforeUnmount = options.unmount;
	const prevBeforeDiff = o._diff || o.__b;
	const prevAfterDiff = options.diffed;
	let prevHook = o._hook || o.__h;
	let prevUseDebugValue = options.useDebugValue;
	// @ts-ignore
	let prevHookName = options.useDebugName;

	// Make sure that we are always the first `option._hook` to be called.
	// This is necessary to ensure that our callstack remains consistent.
	// Othwerwise we'll end up with an unknown number of frames in-between
	// the called hook and `options._hook`. This will lead to wrongly
	// parsed hooks.
	setTimeout(() => {
		prevHook = o._hook || o.__h;
		prevUseDebugValue = options.useDebugValue;
		// @ts-ignore
		prevHookName = options._addHookName || options.__a;

		o._hook = o.__h = (c: Component, index: number, type: number) => {
			const s = getStatefulHooks(c);
			if (s && Array.isArray(s) && s.length > 0 && getComponent(s[0])) {
				s[0]._oldValue = getStatefulHookValue(s);
				s[0]._index = index;
			}

			if (type) {
				// addHookStack(type);
			}

			// Don't continue the chain while the devtools is inspecting hooks.
			// Otherwise the next hook will very likely throw as we're only
			// faking a render and not doing a proper one. #278
			if (!(options as any)._skipEffects && !(options as any).__s) {
				if (prevHook) prevHook(c, index, type);
			}
		};

		options.useDebugValue = (value: any) => {
			// addHookStack(HookType.useDebugValue);
			// addDebugValue(value);
			if (prevUseDebugValue) prevUseDebugValue(value);
		};

		// @ts-ignore
		options._addHookName = options.__a = (name: string | number) => {
			// addHookName(name);
			if (prevHookName) prevHookName(name);
		};
	}, 100);

	o._diff = o.__b = (internal: Internal) => {
		internal.startTime = performance.now();

		if (typeof internal.type === "function") {
			const name = getDisplayName(internal, config);
			recordMark(`${name}_diff`);
		}

		if (prevBeforeDiff != null) prevBeforeDiff(internal);
	};

	options.diffed = vnode => {
		vnode.endTime = performance.now();

		if (typeof vnode.type === "function") {
			endMark(getDisplayName(vnode, config));
		}

		if (prevAfterDiff) prevAfterDiff(vnode);
	};

	o._commit = o.__c = (internal: Internal | null, queue: any[]) => {
		if (prevCommitRoot) prevCommitRoot(internal, queue);

		console.log("COMMIT", internal);
		// These cases are already handled by `unmount`
		if (internal == null) return;

		renderer.onCommit(internal);
	};

	options.unmount = vnode => {
		if (prevBeforeUnmount) prevBeforeUnmount(vnode);
		renderer.onUnmount(vnode as any);
	};

	// Teardown devtools options. Mainly used for testing
	return () => {
		options.unmount = prevBeforeUnmount;
		o._commit = o.__c = prevCommitRoot;
		options.diffed = prevAfterDiff;
		o._diff = o.__b = prevBeforeDiff;
		options.vnode = prevVNodeHook;
		o._hook = o.__h = prevHook;
		options.useDebugValue = prevUseDebugValue;
	};
}
