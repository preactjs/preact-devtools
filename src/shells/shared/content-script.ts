import { inject } from "./utils";

inject(chrome.runtime.getURL("initClient.js"), "script");

const port = chrome.runtime.connect({
	name: "content-script",
});
window.addEventListener("message", onEvent);
port.onMessage.addListener(onExtensionEvent);
port.onDisconnect.addListener(() => {
	window.removeEventListener("message", onEvent);
	port.onMessage.removeListener(onExtensionEvent);
});

function onEvent(ev: MessageEvent) {
	if (ev.source === window && ev.data && ev.data.source === "preact-devtools") {
		port.postMessage({
			name: ev.data.name,
			data: ev.data,
		});
	}
}

function onExtensionEvent(message: any) {
	window.postMessage(
		{
			source: "react-devtools-content-script",
			payload: message,
		},
		"*",
	);
}
