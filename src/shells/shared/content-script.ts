const port = chrome.runtime.connect({
	name: "contentScript",
});

function onExtensionEvent(message: any) {
	window.postMessage(
		{
			source: "preact-devtools-content-script",
			...message,
		},
		"*",
	);
}

let backendInitialized = false;

port.onMessage.addListener(onExtensionEvent);
port.onDisconnect.addListener(() => {
	backendInitialized = false;
	window.removeEventListener("message", onEvent);
	port.onMessage.removeListener(onExtensionEvent);
});

function onEvent(ev: MessageEvent) {
	if (ev.source === window && ev.data) {
		if (
			ev.data.source === "preact-devtools-content-script" &&
			ev.data.name === "initialized"
		) {
			backendInitialized = true;
		} else if (backendInitialized && ev.data.source === "preact-devtools") {
			port.postMessage({
				name: ev.data.name,
				data: ev.data,
			});
		}
	}
}
window.addEventListener("message", onEvent);

function pingBackend() {
	window.postMessage(
		{
			source: "preact-devtools-content-script",
			name: "ping-backend",
			payload: {
				ping: true,
			},
		},
		"*",
	);
}

pingBackend();

// On page reload the content script may be initialized before the backend
if (!backendInitialized) {
	let interval: any;
	interval = setInterval(() => {
		if (backendInitialized) {
			clearInterval(interval);
		} else {
			pingBackend();
		}
	}, 500);
}
