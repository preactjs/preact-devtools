import { render, h } from "preact";
import { DevTools } from "../../view/components/Devtools";
import { injectStyles } from "./utils";
import { createStore } from "../../view/store";
import { applyEvent } from "../../adapter/events";

let created = false;
function createPanel() {
	if (created) return;
	created = true;

	chrome.devtools.network.onNavigated.removeListener(checkPage);

	const store = createStore();
	let doc: Document;

	async function initPort() {
		try {
			// Load theme
			const theme = await new Promise(res => {
				chrome.storage.sync.get(["theme"], result => res(result.theme));
			});

			if (theme) {
				store.theme.$ = theme as any;
			}
		} catch (e) {
			// We don't really care if we couldn't load the theme
			console.error(e);
		}

		// Listen to messages from the content-script
		const { tabId } = chrome.devtools.inspectedWindow;
		const port = chrome.runtime.connect({
			name: "" + tabId,
		});

		store.subscribe((name, data) => {
			port!.postMessage({ name, payload: data });
		});

		const dispose = store.theme.on(v => {
			try {
				chrome.storage.sync.set({ theme: v });
			} catch (e) {
				// Storing the theme is not a critical operation, so we'll
				// just log the error and continue
				console.error(e);
			}
		});

		port!.onDisconnect.addListener(() => {
			dispose();
		});

		port!.onMessage.addListener(msg => {
			console.log("RECEIVED", msg.data.payload);
			const payload = msg.data.payload;
			applyEvent(store, payload.name, payload.payload);
		});

		const root = doc.getElementById("root")!;
		root.innerHTML = "";
		render(h(DevTools, { store }), root);
	}

	chrome.devtools.panels.create("Preact", "", "panel.html", panel => {
		panel.onShown.addListener(window => {
			doc = window.document;
			doc.body.classList.add(
				(chrome.devtools.panels as any).themeName || "light",
			);

			injectStyles(chrome.runtime.getURL("./index.css"));

			initPort();
		});

		// Re-initialize panel when a new page is loaded.
		chrome.devtools.network.onNavigated.addListener(() => {
			store.actions.clear();
			initPort();
		});
	});
}

function checkPreact() {
	return new Promise((resolve, reject) => {
		chrome.devtools.inspectedWindow.eval(
			"window.__PREACT_DEVTOOLS__ && window.__PREACT_DEVTOOLS__.renderers.size > 0",
			(found, err) => (err ? reject(err) : resolve(found)),
		);
	});
}

async function checkPage() {
	const hasPreact = await checkPreact();
	if (hasPreact) {
		createPanel();
	} else {
		setTimeout(checkPage, 1000);
	}
}

checkPage();
chrome.devtools.network.onNavigated.addListener(checkPage);
