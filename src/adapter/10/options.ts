import { Options, VNode, ComponentConstructor, Component } from "preact";
import { recordMark, endMark } from "../marks";
import {
	getDisplayName,
	setNextState,
	getNextState,
	getStatefulHooks,
	getStatefulHookValue,
	getComponent,
} from "./bindings";
import {
	addDebugValue,
	addHookName,
	addHookStack,
	HookType,
} from "../shared/hooks";
import { storeTime, VNodeTimings } from "../shared/timings";
import { getVNodeId, IdMappingState } from "../shared/idMapper";
import { Renderer } from "../renderer";
import { RendererConfig } from "../shared/renderer";

export type OptionsV10 = Options;

/**
 * Inject tracking into setState
 */
function trackPrevState(Ctor: ComponentConstructor) {
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

export function setupOptionsV10(
	options: Options,
	renderer: Renderer,
	config: RendererConfig,
	ids: IdMappingState<VNode>,
	timings: VNodeTimings,
) {
	// Track component state. Only supported in Preact > 10.4.0
	if (config.Component) {
		trackPrevState(config.Component);
	}

	const o = options as any;

	// Store (possible) previous hooks so that we don't overwrite them
	const prevVNodeHook = options.vnode;
	const prevCommitRoot = o._commit || o.__c;
	const prevBeforeUnmount = options.unmount;
	const prevBeforeDiff = o._diff || o.__b;
	const prevAfterDiff = options.diffed;
	let prevHook = o._hook || o.__h;
	let prevUseDebugValue = options.useDebugValue;
	// @ts-ignore
	let prevHookName = options.useDebugName;

	options.vnode = vnode => {
		const id = getVNodeId(ids, vnode);
		// FIXME: Does the negative end thing screw up the profiler?
		storeTime(timings.start, id, 0);
		storeTime(timings.end, id, -1);
		if (prevVNodeHook) prevVNodeHook(vnode);
	};

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
			const vnode = (c as any)._vnode || (c as any).__v;
			const s = getStatefulHooks(vnode);
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
				if (prevHook) prevHook(c, index, type);
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

	o._diff = o.__b = (vnode: VNode) => {
		const id = getVNodeId(ids, vnode);
		storeTime(timings.start, id, performance.now());

		if (typeof vnode.type === "function") {
			const name = getDisplayName(vnode, config);
			recordMark(`${name}_diff`);
		}

		if (prevBeforeDiff != null) prevBeforeDiff(vnode);
	};

	options.diffed = vnode => {
		const id = getVNodeId(ids, vnode);
		storeTime(timings.end, id, performance.now());

		if (typeof vnode.type === "function") {
			endMark(getDisplayName(vnode, config));
		}

		if (prevAfterDiff) prevAfterDiff(vnode);
	};

	o._commit = o.__c = (vnode: VNode | null, queue: any[]) => {
		if (prevCommitRoot) prevCommitRoot(vnode, queue);

		// These cases are already handled by `unmount`
		if (vnode == null) return;

		renderer.onCommit(vnode);
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
