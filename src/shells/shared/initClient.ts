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

		injectStyles(chrome.runtime.getURL("preact-devtools-page.css"));
	}
});

// Firefox seemingly doesn't always reinject content scripts
window.addEventListener("pageshow", ev => {
	if (!lastDetection || ev.target !== window.document) {
		return;
	}
	chrome.runtime.sendMessage(lastDetection);
});

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
