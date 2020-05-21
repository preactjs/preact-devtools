import { render, h } from "preact";
import { DevTools } from "../../../view/components/Devtools";
import { createStore } from "../../../view/store";
import { applyEvent } from "../../../adapter/events/events";
import { debug } from "../../../debug";
import { DevtoolsPanelName } from "../../../constants";
import {
	loadSettings,
	storeTheme,
	storeCaptureRenderReasons,
	storeDebugMode,
	storeHighlightUpdates,
} from "./settings";

async function showPanel(): Promise<Window> {
	return new Promise(resolve => {
		chrome.devtools.panels.create("Preact", "", "/panel/panel.html", panel => {
			panel.onShown.addListener(window => resolve(window));
		});
	});
}

const port = chrome.runtime.connect({
	name: DevtoolsPanelName,
});

let initialized = false;

const store = createStore();

async function initDevtools() {
	initialized = true;
	const window = await showPanel();

	// Settings
	await loadSettings(window, store);
	store.theme.on(v => storeTheme(v));
	store.profiler.captureRenderReasons.on(v => storeCaptureRenderReasons(v));
	store.profiler.highlightUpdates.on(v => storeHighlightUpdates(v));
	store.debugMode.on(v => storeDebugMode(v));

	if (process.env.DEBUG) {
		(window as any).store = store;
	}

	// Render our application
	const root = window.document.getElementById("root")!;
	render(h(DevTools, { store, window }), root);
}

// Send messages from devtools to the content script
const destroy = store.subscribe((type, data) => {
	debug("<- devtools", type, data);
	port.postMessage({ type, data, source: DevtoolsPanelName });
});

port.onDisconnect.addListener(() => {
	destroy();
});

// Subscribe to messages from content script
port.onMessage.addListener(async message => {
	if (!initialized) {
		debug("initialize devtools panel");
		await initDevtools();
	}

	if (message.type === "init") {
		debug("> message", message);
		port.postMessage({
			type: "init",
			tabId: chrome.devtools.inspectedWindow.tabId,
			source: DevtoolsPanelName,
		});
	} else {
		debug("-> devtools", message);
		applyEvent(store, message.type, message.data);
	}
});

// Clear store when we navigate away from the current page.
// Only fires on "true" navigation events, not when navigation
// is done via the HTML5 history API
chrome.devtools.network.onNavigated.addListener(() => {
	debug("== Navigation: clear devtools state ==");
	store.clear();
});

// Notify background page of the panel
// Note sometimes the tabId is null in Chrome...
if (chrome.devtools.inspectedWindow.tabId) {
	port.postMessage({
		type: "init",
		tabId: chrome.devtools.inspectedWindow.tabId,
		source: DevtoolsPanelName + "_init",
	});
}
