import { createHook } from "../../src/adapter/hook.ts";
import { DevtoolsToClient, PageHookName } from "../../src/constants.ts";

(globalThis as any).__PREACT_DEVTOOLS__ = createHook({
	listen: (type, callback) => {
		globalThis.addEventListener("message", (e) => {
			if (e.source === globalThis.top && e.data.source === DevtoolsToClient) {
				const data = e.data;
				if (data.type === type) callback(data.data);
			}
		});
	},
	send: (type, data) => {
		// console.log("send", type, data);
		globalThis.top!.postMessage(
			{
				source: PageHookName,
				type,
				data,
			},
			"*",
		);
	},
	listenToPage: (type, callback) => {
		globalThis.addEventListener("message", (e) => {
			if (e.source === window && e.data.source === PageHookName) {
				const data = e.data;
				if (data.type === type) callback(data.data);
			}
		});
	},
});

(async () => {
	await import("preact/devtools");
	import("./apps/context-displayName");
})();
