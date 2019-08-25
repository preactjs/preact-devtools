import { ID } from "../view/store";
import {
	Options as PreactOptions,
	VNode as PreactVNode,
	Component,
} from "preact";
import { EmitterFn } from "./hook";
import { flush } from "./events";
import { createCommit } from "./renderer";
import { IdMapper } from "./IdMapper";

export interface VNode extends PreactVNode {
	old: VNode | null;
	_parent: VNode | null;
	_children: null | VNode[];
	_component: Component | null;
}

export interface Options extends Pick<PreactOptions, "vnode" | "unmount"> {
	_commit: (vnode: VNode) => void;
	_diff: (vnode: VNode) => void;
	diffed: (vnode: VNode, oldVNode: VNode) => void;
}

export type Path = Array<string | number>;

export interface Adapter {
	findDomForVNode(id: ID): Array<HTMLElement | Text> | null;
	inspect(id: ID): InspectData;
	logVNode(id: ID): void;
	updateProps(id: ID, path: Path, value: any): void;
	selectVNode(id: ID): void;
	onCommit(vnode: VNode): void;
	onUnmount(vnode: VNode): void;
	connect(): void;
}

export interface InspectData {
	id: ID;
	name: string;
	type: any;
	context: Record<string, any> | null;
	hooks: any | null;
	props: Record<string, any> | null;
	state: Record<string, any> | null;
}

export function setupOptions(options: Options, adapter: Adapter) {
	window.parent.postMessage({ source: "preact-devtools-detector" }, "*");

	adapter.connect();

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

export function createAdapter(emit: EmitterFn, ids: IdMapper) {
	const roots = new Set<VNode>();

	const adapter: Adapter = {
		// Receive
		findDomForVNode(id) {
			console.log("find dom", id);
			return null;
		},
		inspect(id) {
			console.log("inspect", id);
			return {
				context: null,
				hooks: null,
				id,
				name: "foo",
				props: null,
				state: null,
				type: 2,
			};
		},
		logVNode(id) {
			console.log("Log", id);
		},
		selectVNode(id) {
			console.log("select", id);
		},
		updateProps(id) {
			console.log("update props", id);
		},
		// Send
		onCommit(vnode) {
			const commit = createCommit(ids, roots, vnode);
			console.log("flush");
			flush(emit, commit);
		},
		onUnmount(vnode) {
			console.log("unmount rq", vnode);
		},
		connect() {},
	};

	return adapter;
}
