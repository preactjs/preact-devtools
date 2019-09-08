import { Options, VNode } from "preact";
import { Renderer } from "./renderer";

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
