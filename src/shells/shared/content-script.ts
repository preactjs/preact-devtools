import { injectStyles } from "./utils";
import {
	ClientToDevtools,
	ContentScriptName,
	DevtoolsToClient,
	PageHookName,
} from "../../constants";
import { debug } from "../../debug";

const enum Status {
	Disconnected = "disconnected",
	Connected = "connected",
	Pending = "pending",
}

/** Connection to background page */
let connection: chrome.runtime.Port | null = null;

let status: Status = Status.Disconnected;
let queue: any[] = [];

debug("content-script running");

/** Handle message from background script */
function handleMessage(message: any) {
	debug("<-", message);
	if (message.type === "init" && message.tabId) {
		status = Status.Connected;

		// If the queue is empty we re-openend the devtools. Whenever the
		// panel is closed, our panel frame is completely destroyed and we
		// need to requery the whole component tree
		if (queue.length === 0) {
			debug("  refresh tree", message);
			window.postMessage({ type: "refresh", source: DevtoolsToClient }, "*");
			return;
		} else {
			debug("  flush initial queue", queue, message);
			queue.forEach(ev => connection!.postMessage(ev));
			queue = [];
		}
	}
	window.postMessage({ ...message, source: DevtoolsToClient }, "*");
}

/** Handle disconnect from background script */
function handleDisconnect() {
	connection = null;
	status = Status.Disconnected;
}

/** Forward messages from the page to the devtools */
window.addEventListener("message", e => {
	if (e.source === window && e.data && e.data.source === PageHookName) {
		const data = e.data;
		debug("->", data);

		if (status === Status.Disconnected) {
			status = Status.Pending;
			debug("connecting content-script...");
			connection = chrome.runtime.connect({
				name: ContentScriptName,
			});
			connection.onMessage.addListener(handleMessage);
			connection.onDisconnect.addListener(handleDisconnect);

			// Inject styles only when when Preact was detected
			injectStyles(chrome.runtime.getURL("preact-devtools-page.css"));
		}

		if (connection === null) {
			// eslint-disable-next-line no-console
			return console.warn("Unable to connect to Preact Devtools extension.");
		}

		if (status !== Status.Connected && data.type !== "init") {
			debug("  queue", data);
			queue.push(data);
		} else {
			connection.postMessage({ ...data, source: ClientToDevtools });
		}
	}
});
