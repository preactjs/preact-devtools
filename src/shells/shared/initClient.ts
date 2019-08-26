import { inject } from "./utils";

window.addEventListener("message", ev => {
	if (
		ev.source === window &&
		ev.data &&
		ev.data.source === "preact-devtools-detector"
	) {
		chrome.runtime.sendMessage({
			hasPreact: true,
		});
	}
});

inject(chrome.runtime.getURL("installHook.js"), "script");
