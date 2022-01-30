import { recordMark, endMark } from "../marks";
import {
	getDisplayName,
	setNextState,
	getNextState,
	getComponent,
	Internal,
	getStatefulHooks,
	getStatefulHookValue,
	TYPE_COMPONENT,
} from "./bindings";
import { RendererConfig } from "../shared/renderer";
import { Renderer } from "../renderer";
import {
	addDebugValue,
	addHookName,
	addHookStack,
	HookType,
} from "../shared/hooks";
import { getVNodeId, IdMappingState } from "../shared/idMapper";
import { VNodeTimings } from "../shared/timings";

export interface VNode {
	foo: any;
}

export interface OptionsV11 {
	unmount?(internal: Internal): void;
	diffed?(internal: Internal): void;
	_root?(
		vnode: any,
		parent: Element | Document | ShadowRoot | DocumentFragment,
	): void;
	__?(
		vnode: any,
		parent: Element | Document | ShadowRoot | DocumentFragment,
	): void;

	_diff?(internal: Internal, vnode?: VNode): void;
	__b?(internal: Internal, vnode?: VNode): void;

	_commit?(internal: Internal | null, commitQueue: any): void;
	__c?(internal: Internal | null, commitQueue: any): void;

	_render?(internal: Internal): void;
	__r?(internal: Internal): void;

	_hook?(component: any, index: number, type: HookType): void;
	__h?(component: any, index: number, type: HookType): void;

	_skipEffects?: boolean;
	__s?: boolean;

	_catchError?(error: any, internal: Internal): void;
	__e?(error: any, internal: Internal): void;

	_internal?(internal: Internal, vnode: VNode | string): void;
	__i?(internal: Internal, vnode: VNode | string): void;

	useDebugValue?(value: string | number): void;
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
	renderer: Renderer,
	config: RendererConfig,
	ids: IdMappingState<Internal>,
	timings: VNodeTimings,
) {
	// Track component state. Only supported in Preact > 10.4.0
	if (config.Component) {
		trackPrevState(config.Component);
	}

	const o = options;

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

		o._hook = o.__h = (internal: Internal, index: number, type: number) => {
			const s = getStatefulHooks(internal);
			console.log("hook v11", { internal, s, type });
			if (s && Array.isArray(s) && s.length > 0 && getComponent(s[0])) {
				s[0]._oldValue = getStatefulHookValue(s);
				s[0]._index = index;
			}

			if (type) {
				addHookStack(type);
			}

			// Don't continue the chain while the devtools is inspecting hooks.
			// Otherwise the next hook will very likely throw as we're only
			// faking a render and not doing a proper one. #278
			if (!(options as any)._skipEffects && !(options as any).__s) {
				if (prevHook) prevHook(internal, index, type);
			}
		};

		options.useDebugValue = (value: any) => {
			addHookStack(HookType.useDebugValue);
			addDebugValue(value);
			if (prevUseDebugValue) prevUseDebugValue(value);
		};

		// @ts-ignore
		options._addHookName = options.__a = (name: string | number) => {
			addHookName(name);
			if (prevHookName) prevHookName(name);
		};
	}, 100);

	o._diff = o.__b = (internal: Internal) => {
		const id = getVNodeId(ids, internal);
		timings.start.set(id, performance.now());

		if (internal.flags & TYPE_COMPONENT) {
			const name = getDisplayName(internal, config);
			recordMark(`${name}_diff`);
		}

		if (prevBeforeDiff != null) prevBeforeDiff(internal);
	};

	options.diffed = internal => {
		const id = getVNodeId(ids, internal);
		timings.end.set(id, performance.now());

		if (internal.flags & TYPE_COMPONENT) {
			endMark(getDisplayName(internal, config));
		}

		if (prevAfterDiff) prevAfterDiff(internal);
	};

	o._commit = o.__c = (internal: Internal | null, queue: any[]) => {
		if (prevCommitRoot) prevCommitRoot(internal, queue);

		// These cases are already handled by `unmount`
		if (internal == null) return;

		renderer.onCommit(internal);
	};

	options.unmount = internal => {
		if (prevBeforeUnmount) prevBeforeUnmount(internal);
		renderer.onUnmount(internal);
	};

	// Teardown devtools options. Mainly used for testing
	return () => {
		options.unmount = prevBeforeUnmount;
		o._commit = o.__c = prevCommitRoot;
		options.diffed = prevAfterDiff;
		o._diff = o.__b = prevBeforeDiff;
		options._internal = prevVNodeHook;
		o._hook = o.__h = prevHook;
		options.useDebugValue = prevUseDebugValue;
	};
}
