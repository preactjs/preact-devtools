import { setupInlineDevtools } from "../../src/shells/inline/index";

const container = document.getElementById("app")!;

const store = setupInlineDevtools(container, window);

// @ts-ignore
window.parent.store = store;
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
