const port = chrome.runtime.connect({
	name: "contentScript",
});
port.onMessage.addListener(onExtensionEvent);
port.onDisconnect.addListener(() => {
	window.removeEventListener("message", onEvent);
	port.onMessage.removeListener(onExtensionEvent);
});

function onExtensionEvent(message: any) {
	window.postMessage(
		{
			source: "preact-devtools-content-script",
			payload: message,
		},
		"*",
	);
}

window.addEventListener("message", onEvent);
function onEvent(ev: MessageEvent) {
	if (ev.source === window && ev.data && ev.data.source === "preact-devtools") {
		console.log("forward", ev.data);
		port.postMessage({
			name: ev.data.name,
			data: ev.data,
		});
	}
}
