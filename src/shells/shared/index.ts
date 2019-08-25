import { render, h } from "preact";
import { DevTools } from "../../view/components/Devtools";
import { injectStyles } from "./utils";
import { createStore } from "../../view/store";
import { applyOperations } from "../../adapter/events";

const store = createStore();

let created = false;
function createPanel() {
	if (created) return;
	created = true;

	chrome.devtools.panels.create("Preact", "", "panel.html", panel => {
		panel.onShown.addListener(window => {
			const doc = window.document;
			doc.body.classList.add(
				(chrome.devtools.panels as any).themeName || "light",
			);

			injectStyles(chrome.runtime.getURL("./index.css"));

			const root = doc.getElementById("root")!;
			root.innerHTML = "";
			render(h(DevTools, { store }), root);
		});
	});
}

// Listen to messages from the content-script
const { tabId } = chrome.devtools.inspectedWindow;
const port = chrome.runtime.connect({
	name: "" + tabId,
});

port.onMessage.addListener(msg => {
	const payload = msg.data.payload;
	if (payload.name === "operation") {
		applyOperations(store, payload.payload);
	}
	console.log({ msg2: msg });
});

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
