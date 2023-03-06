import { render, h } from "preact";
import { DevTools } from "../../../view/components/Devtools";
import { createStore } from "../../../view/store";
import { applyEvent } from "../../../adapter/protocol/events";
import { debug } from "../../../debug";
import { DevtoolsPanelName } from "../../../constants";
import {
	loadSettings,
	storeTheme,
	storeCaptureRenderReasons,
	storeDebugMode,
	storeHighlightUpdates,
	storeFilters,
} from "./settings";
import { effect } from "@preact/signals";
import { isFirefox } from "../utils";

// Updated when the selection in the native elements panel changed.
let hostSelectionChanged = false;

async function showPanel(): Promise<{
	window: Window;
	panel: chrome.devtools.panels.ExtensionPanel;
}> {
	return new Promise(resolve => {
		chrome.devtools.panels.create("Preact", "", "/panel/panel.html", panel => {
			const fn = (window: Window) => {
				resolve({ window, panel });
				panel.onShown.removeListener(fn);
			};
			panel.onShown.addListener(fn);
		});
	});
}

const port = chrome.runtime.connect({
	name: DevtoolsPanelName,
});

let initialized = false;

const store = createStore();

// Sync selection from browser to devtools
chrome.devtools.panels.elements.onSelectionChanged.addListener(() => {
	store.emit("load-host-selection", null);
	chrome.devtools.inspectedWindow.eval(
		`window.__PREACT_DEVTOOLS__ && window.__PREACT_DEVTOOLS__.$0 !== $0
			? (window.__PREACT_DEVTOOLS__.$0 = $0, true)
			: false
		`,
		(result: boolean) => {
			hostSelectionChanged = result;
		},
	);
});

// Inspect host node
function inspectHostNode() {
	chrome.devtools.inspectedWindow.eval(
		`window.__PREACT_DEVTOOLS__ && window.__PREACT_DEVTOOLS__.$0 !== $0
			? (inspect(window.__PREACT_DEVTOOLS__.$0), true)
			: false
		`,
		(_, error) => {
			if (error) {
				// eslint-disable-next-line no-console
				console.error(error);
			}
		},
	);
}

async function initDevtools() {
	initialized = true;
	const { window, panel } = await showPanel();
	panel.onShown.addListener(() => {
		if (hostSelectionChanged) {
			hostSelectionChanged = false;
			store.emit("load-host-selection", null);
		}
	});

	// Settings
	await loadSettings(window, store);
	effect(() => storeTheme(store.theme.value));
	effect(() =>
		storeCaptureRenderReasons(store.profiler.captureRenderReasons.value),
	);
	effect(() => storeHighlightUpdates(store.profiler.highlightUpdates.value));
	effect(() => storeDebugMode(store.debugMode.value));

	if (__DEBUG__) {
		(window as any).store = store;
	}

	// Render our application
	const container = window.document.getElementById("preact-devtools-root")!;
	render(h(DevTools, { store, window }), container);
}

// Send messages from devtools to the content script
const destroy = store.subscribe((type, data) => {
	debug("<- devtools", type, data);

	// We must call it from here to have access to native
	// devtool-specific functions, like inspect()
	if (type === "inspect-host-node") {
		inspectHostNode();
	}

	port.postMessage({ type, data, source: DevtoolsPanelName });

	if (type === "view-source") {
		// Wait for the content-script to set `__PREACT_DEVTOOLS__.$type`
		// to the correct function
		setTimeout(() => {
			chrome.devtools.inspectedWindow.eval(`
				(function() {
					const type = window.__PREACT_DEVTOOLS__
						&& window.__PREACT_DEVTOOLS__.$type;
		
					if (type != null) {
						inspect(type);
					}
				})()
			`);
		}, 100);
	} else if (type === "update-filter") {
		storeFilters(data as any);
	}
});

port.onDisconnect.addListener(() => {
	destroy();
});

/**
 * To avoid dropping messages on reload that may have already been
 * sent by us, we keep messages from the content script in memory
 * until the navigation event has been acknowledged. This is soley
 * done to work around an issue in Firefox where the `onNavigated`
 * event is only fired after all resources are loaded. That's too
 * late for us as the content script likely already sent some events.
 * See: https://bugzilla.mozilla.org/show_bug.cgi?id=1552686
 */
const pending = new Map<number, any[]>();

const IS_FIREFOX = isFirefox();

// Subscribe to messages from content script
port.onMessage.addListener(async message => {
	if (!initialized) {
		debug("initialize devtools panel");
		await initDevtools();
	}

	const tabId = chrome.devtools.inspectedWindow.tabId;
	if (message.type === "init") {
		debug("> message", message);

		if (IS_FIREFOX && pending.has(tabId)) {
			store.clear();
		}

		pending.set(tabId, []);

		port.postMessage({
			type: "init",
			tabId,
			source: DevtoolsPanelName,
		});
	} else {
		debug("-> devtools", message);

		if (IS_FIREFOX) {
			const backup = pending.get(tabId);
			if (backup) {
				backup.push({ ...message });
			}

			applyEvent(store, message.type, message.data);
		} else {
			applyEvent(store, message.type, message.data);
		}
	}
});

// Clear store when we navigate away from the current page.
// Only fires on "true" navigation events, not when navigation
// is done via the HTML5 history API.
//
// Workaround for Firefox: The event only fires *after* all scripts
// are loaded at which point our content script will have sent
// events. So for Firefox we need to keep a queue around.
// See: https://bugzilla.mozilla.org/show_bug.cgi?id=1552686
chrome.devtools.network.onNavigated.addListener(() => {
	const tabId = chrome.devtools.inspectedWindow.tabId;
	const backup = pending.get(tabId) || [];
	debug(
		"== Navigation: clear devtools state == pending length: " + backup.length,
	);
	store.clear();

	if (backup.length) {
		backup.forEach(message => {
			applyEvent(store, message.type, message.data);
		});
		pending.delete(tabId);
	}
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
