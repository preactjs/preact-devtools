import { createHook } from "../../src/adapter/hook";
import { DevtoolsToClient, PageHookName } from "../../src/constants";

(window as any).__PREACT_DEVTOOLS__ = createHook({
	listen: (type, callback) => {
		window.addEventListener("message", e => {
			if (e.source === window.top && e.data.source === DevtoolsToClient) {
				const data = e.data;
				if (data.type === type) callback(data.data);
			}
		});
	},
	send: (type, data) => {
		// console.log("send", type, data);
		window.top.postMessage(
			{
				source: PageHookName,
				type,
				data,
			},
			"*",
		);
	},
});

(async () => {
	await import("preact/devtools");
	import("./apps/context-displayName");
})();
