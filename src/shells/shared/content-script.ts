import { inject, injectStyles } from "./utils";
import {
	ContentScript,
	DevtoolsToClient,
	ClientToDevtools,
} from "./background/constants";

/** Connection to background page */
let connection: chrome.runtime.Port | null = null;

/** Forward messages from the page to the devtools */
window.addEventListener(ClientToDevtools, e => {
	const data = (e as CustomEvent<any>).detail;

	if (data.type === "init") {
		connection = chrome.runtime.connect({
			name: ContentScript,
		});
		connection.onMessage.addListener(handleMessage);
		connection.onDisconnect.addListener(handleDisconnect);

		// Inject styles only when when Preact was detected
		injectStyles(chrome.runtime.getURL("preact-devtools-page.css"));
	}

	if (connection === null) {
		return console.warn("Unable to connect to Preact Devtools extension.");
	}

	connection.postMessage(data);
});

/** Handle message from background script */
function handleMessage(message: any) {
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
