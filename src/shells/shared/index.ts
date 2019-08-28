import { render, h } from "preact";
import { DevTools } from "../../view/components/Devtools";
import { injectStyles } from "./utils";
import { createStore } from "../../view/store";
import { applyOperations } from "../../adapter/events";

let created = false;
function createPanel() {
	if (created) return;
	created = true;

	chrome.devtools.network.onNavigated.removeListener(checkPage);

	chrome.devtools.panels.create("Preact", "", "panel.html", panel => {
		panel.onShown.addListener(window => {
			const doc = window.document;
			doc.body.classList.add(
				(chrome.devtools.panels as any).themeName || "light",
			);

			injectStyles(chrome.runtime.getURL("./index.css"));

			// Listen to messages from the content-script
			const { tabId } = chrome.devtools.inspectedWindow;
			const port = chrome.runtime.connect({
				name: "" + tabId,
			});

			const store = createStore((name, data) => {
				port.postMessage({ name, payload: data });
			});

			port.onMessage.addListener(msg => {
				console.log("RECEIVED", msg.data.payload);
				const payload = msg.data.payload;
				if (payload.name === "operation") {
					applyOperations(store, payload.payload);
					console.log(
						store.nodes().size,
						Array.from(store.nodes().values()).map(x => x.name),
					);
				}
			});

			const root = doc.getElementById("root")!;
			root.innerHTML = "";
			render(h(DevTools, { store }), root);
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
