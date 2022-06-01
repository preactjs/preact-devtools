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
import { createVNodeTimings } from "../shared/timings";
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
) {
	// Track component state. Only supported in Preact > 10.4.0
	if (config.Component) {
		trackPrevState(config.Component);
	}

	let timings = createVNodeTimings<VNode>();
	const owners = new Map<VNode, VNode>();
	let ownerStack: VNode[] = [];

	const o = options as any;

	// Store (possible) previous hooks so that we don't overwrite them
	const prevVNodeHook = options.vnode;
	const prevCommitRoot = o._commit || o.__c;
	const prevBeforeUnmount = options.unmount;
	const prevBeforeDiff = o._diff || o.__b;
	const prevRender = o._render || o.__r;
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

	options.vnode = (vnode: VNode) => {
		owners.set(vnode, ownerStack[ownerStack.length - 1]);
		if (prevVNodeHook) prevVNodeHook(vnode);
	};

	o._diff = o.__b = (vnode: VNode) => {
		if (typeof vnode.type === "function") {
			timings.start.set(vnode, performance.now());
			const name = getDisplayName(vnode, config);
			recordMark(`${name}_diff`);
		}

		if (prevBeforeDiff != null) prevBeforeDiff(vnode);
	};

	o._render = o.__r = (vnode: VNode, parent: VNode | null) => {
		if (typeof vnode.type === "function" && vnode.type !== config.Fragment) {
			ownerStack.push(vnode);
		}
		if (prevRender != null) prevRender(vnode, parent);
	};

	options.diffed = vnode => {
		if (typeof vnode.type === "function") {
			if (vnode.type !== config.Fragment) {
				ownerStack.pop();
			}

			timings.end.set(vnode, performance.now());
			endMark(getDisplayName(vnode, config));
		}

		if (prevAfterDiff) prevAfterDiff(vnode);
	};

	o._commit = o.__c = (vnode: VNode | null, queue: any[]) => {
		if (prevCommitRoot) prevCommitRoot(vnode, queue);

		// These cases are already handled by `unmount`
		if (vnode == null) return;

		const tmpTimings = timings;
		ownerStack = [];
		timings = createVNodeTimings();
		renderer.onCommit(vnode, owners, tmpTimings, null);
	};

	options.unmount = vnode => {
		if (prevBeforeUnmount) prevBeforeUnmount(vnode);
		timings.start.delete(vnode);
		timings.end.delete(vnode);
		owners.delete(vnode);
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
