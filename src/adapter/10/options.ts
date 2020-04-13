import { Options, VNode, ComponentConstructor, Component } from "preact";
import { Preact10Renderer, RendererConfig10 } from "./renderer";
import { recordMark, endMark } from "./marks";
import {
	getDisplayName,
	setNextState,
	getNextState,
	getStatefulHooks,
	getStatefulHookValue,
	getComponent,
} from "./vnode";
import { addHookStack } from "./renderer/inspectVNode";

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

export function setupOptions(
	options: Options,
	renderer: Preact10Renderer,
	config: RendererConfig10,
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
	const prevHook = o._hook || o.__h;

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

	o._hook = o.__h = (c: Component, index: number, type: number) => {
		const s = getStatefulHooks(c);
		if (Array.isArray(s) && getComponent(s[0])) {
			s[0]._oldValue = getStatefulHookValue(s);
			s[0]._index = index;
		}

		if (type) {
			addHookStack(type);
		}

		if (prevHook) prevHook(c);
	};

	o._diff = o.__b = (vnode: VNode) => {
		vnode.startTime = performance.now();

		if (typeof vnode.type === "function") {
			const name = getDisplayName(vnode, config);
			recordMark(`${name}_diff`);
		}

		if (prevBeforeDiff != null) prevBeforeDiff(vnode);
	};

	options.diffed = vnode => {
		vnode.endTime = performance.now();

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
	};
}
