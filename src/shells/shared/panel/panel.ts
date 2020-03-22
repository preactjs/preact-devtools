import { render, h } from "preact";
import { DevTools } from "../../../view/components/Devtools";
import { injectStyles } from "../utils";
import { createStore } from "../../../view/store";
import { applyEvent } from "../../../adapter/events/events";
import { debug } from "../../../debug";
import { ContentScriptName } from "../../../constants";
import { loadTheme, storeTheme } from "./theme";

// let created = false;
// function createPanel() {
// 	if (created) return;
// 	created = true;

// 	let doc: Document;

// 	async function initPort() {
// 		// Listen to messages from the content-script
// 		const { tabId } = chrome.devtools.inspectedWindow;
// 		const port = chrome.runtime.connect({
// 			name: "" + tabId,
// 		});

// 		store.subscribe((type, data) => {
// 			port!.postMessage({ type, data });
// 		});

// 		port!.onDisconnect.addListener(() => {
// 			store.actions.clear();
// 			dispose();
// 		});

// 		port!.onMessage.addListener(msg => {
// 			debug("-> devtools", msg);
// 			applyEvent(store, msg.type, msg.data);
// 		});

// 		const root = doc.getElementById("root")!;
// 		root.innerHTML = "";
// 		render(h(DevTools, { store }), root);
// 	}

// 	// Re-initialize panel when a new page is loaded.
// 	// chrome.devtools.network.onNavigated.addListener(() => {
// 	// 	store.actions.clear();
// 	// 	// initPort();
// 	// });
// }

async function onPanelShown(
	panel: chrome.devtools.panels.ExtensionPanel,
	window: Window,
) {
	console.log("CREATED");
	const store = createStore();

	// Themes
	await loadTheme(window, store);
	store.theme.on(v => storeTheme(v));

	// Render our application
	const root = window.document.getElementById("root")!;
	root.innerHTML = "";
	render(h(DevTools, { store }), root);
}

chrome.runtime.onConnect.addListener(port => {
	if (port.name === ContentScriptName) {
		chrome.devtools.panels.create("Preact", "", "./panel/panel.html", panel => {
			panel.onShown.addListener(window => {
				onPanelShown(panel, window);
			});
		});
	}
});
