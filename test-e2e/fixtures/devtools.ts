import { options, type VNode } from "preact";
import { setupInlineDevtools } from "../../src/shells/inline/index";

const prevVNode = options.vnode;
options.vnode = (vnode: VNode) => {
	const props = vnode.props;
	if (
		vnode.type !== null &&
		props != null &&
		("__source" in props || "__self" in props)
	) {
		const nextProps: Record<string, unknown> = {};
		for (const key in props) {
			const value = (props as any)[key];
			if (key === "__source") (vnode as any).__source = value;
			else if (key === "__self") (vnode as any).__self = value;
			else nextProps[key] = value;
		}
		(vnode as any).props = nextProps;
	}

	if (prevVNode) prevVNode(vnode);
};

const container = document.getElementById("app")!;

const store = setupInlineDevtools(container, window);

// @ts-ignore
window.parent.store = store;
// @ts-ignore
window.__PREACT_DEVTOOLS_READY__ = true;
store.subscribe((name, msg) => {
	window.parent.postMessage(
		{ type: name, data: msg, source: "preact-devtools-to-client" },
		"*",
	);
});
window.parent.postMessage(
	{ type: "foo", data: "nar", source: "preact-devtools-to-client" },
	"*",
);
