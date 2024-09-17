import { debug } from "../../../debug.ts";
import { setPopupStatus } from "../popup/popup.ts";
import {
	ContentScriptName,
	DevtoolsPanelName,
	DevtoolsToClient,
} from "../../../constants.ts";
import { BaseEvent } from "../../../adapter/adapter/port.ts";
import { BackgroundEmitter, Emitter } from "./emitter.ts";

/**
 * Collection of potential targets to connect to by tabId.
 */
const targets = new Map<number, Emitter<any>>();

function addToTarget(tabId: number, port: chrome.runtime.Port) {
	if (!targets.has(tabId)) {
		targets.set(tabId, BackgroundEmitter<any>());
	}
	const target = targets.get(tabId)!;
	target.on(port.name, (m) => port.postMessage(m));
	port.onMessage.addListener((m) => target.emit(port.name, m));

	port.onDisconnect.addListener(() => {
		debug("disconnect", port.name);
		target.emit(port.name, {
			type: "disconnect",
			data: null,
			source: DevtoolsToClient,
		});
		target.off(port.name);
	});
}

/**
 * Handle initial connection from content-script.
 */
function handleContentScriptConnection(port: chrome.runtime.Port) {
	const tabId = port.sender?.tab?.id;
	if (tabId) {
		addToTarget(tabId, port);
		setPopupStatus(tabId, true);
	}
}

/**
 * Handle initial connection from devtools panel.
 */
function handleDevtoolsConnection(port: chrome.runtime.Port) {
	function initialListener(message: BaseEvent<any, any>) {
		if (message.type !== "init") {
			return;
		}

		const { tabId } = message as any;
		addToTarget(tabId, port);
		port.onMessage.removeListener(initialListener);

		if (targets.get(tabId)?.connected().includes(ContentScriptName)) {
			port.postMessage({ type: "init", data: null });
		}
	}

	port.onMessage.addListener(initialListener);
}

/**
 * Each port will have a name that was specified during connection via
 * `chrome.runtime.connect()`. We leverage that to call the correct
 * handler.
 *
 * TODO: Allow 1:n connections
 */
const connectionHandlers: Record<string, (port: chrome.runtime.Port) => void> =
	{
		[ContentScriptName]: handleContentScriptConnection,
		[DevtoolsPanelName]: handleDevtoolsConnection,
	};

chrome.runtime.onConnect.addListener((port) => {
	const handler = connectionHandlers[port.name];
	debug(
		`[${port.sender?.tab?.id}] %cBackground: %cconnecting ${port.name}`,
		"color: yellow;font-weight:bold",
		"color: inherit",
	);
	handler && handler(port);
});
