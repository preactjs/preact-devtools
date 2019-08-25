import { render, h } from "preact";
import { DevTools } from "../../Devtools";
import { injectStyles } from "./utils";

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
			render(h(DevTools, null), root);
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
	}
}

checkPreact();

chrome.devtools.network.onNavigated.addListener(checkPage);
