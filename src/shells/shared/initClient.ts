import { inject, injectStyles } from "./utils";

let lastDetection: any = null;

window.addEventListener("message", ev => {
	if (
		ev.source === window &&
		ev.data &&
		ev.data.source === "preact-devtools-detector"
	) {
		chrome.runtime.sendMessage(
			(lastDetection = {
				hasPreact: true,
			}),
		);
	}
});

// Firefox seemingly doesn't always reinject content scripts
window.addEventListener("pageshow", ev => {
	if (!lastDetection || ev.target !== window.document) {
		return;
	}
	chrome.runtime.sendMessage(lastDetection);
});

inject(chrome.runtime.getURL("installHook.js"), "script");
injectStyles(chrome.runtime.getURL("installHook.css"));
