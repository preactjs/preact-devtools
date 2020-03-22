import { inject, injectStyles } from "./utils";
import {
	ContentScriptName,
	DevtoolsToClient,
	ClientToDevtools,
} from "../../constants";
import { debug } from "../../debug";

/** Connection to background page */
let connection: chrome.runtime.Port | null = null;

debug("content-script running");

let connected = false;
let queue: any[] = [];

/** Forward messages from the page to the devtools */
window.addEventListener(ClientToDevtools, e => {
	const data = (e as CustomEvent<any>).detail;

	debug("->", data);
	if (data.type === "init") {
		connection = chrome.runtime.connect({
			name: ContentScriptName,
		});
		connection.onMessage.addListener(handleMessage);
		connection.onDisconnect.addListener(handleDisconnect);

		// Inject styles only when when Preact was detected
		injectStyles(chrome.runtime.getURL("preact-devtools-page.css"));
	}

	if (connection === null) {
		return console.warn("Unable to connect to Preact Devtools extension.");
	}

	if (!connected) {
		debug("  queue", data);
		queue.push(data);
	} else {
		debug("  send", data);
		connection.postMessage(data);
	}
});

/** Handle message from background script */
function handleMessage(message: any) {
	debug("<-", message);
	if (message.type === "initialized") {
		connected = true;
		debug("  flush initial queue", queue);
		queue.forEach(ev => connection!.postMessage(ev));
	}
	window.dispatchEvent(new CustomEvent(DevtoolsToClient, { detail: message }));
}

/** Handle disconnect from background script */
function handleDisconnect() {
	connection = null;
}

// Only inject for HTML pages
if (document.contentType === "text/html") {
	// We need to inject in time to catch the initial mount. There is no
	// reliable way to ensure that our code runs before the page's javascript.
	// Using a script tag with an src attribute leads to a race condition
	// where the page's js will be run before us when it's cached by the
	// browser or by a service worker.
	//
	//   inject(chrome.runtime.getURL("installHook.js"), "script");
	//
	// The only solution so far is to set script.textContent directly. For
	// that we need to do some custom bundling logic to store the content of
	// installHook.ts in a variable.
	//
	// See: https://github.com/preactjs/preact-devtools/issues/85
	//
	// The string "CODE_TO_INJECT" will be replaced by our build tool.
	inject(`;(${"CODE_TO_INJECT"}(window))`, "code");
}
