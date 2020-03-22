import { debug } from "../../../debug";
import { setPopupStatus } from "../popup/popup";
import { ContentScriptName, DevtoolsPanelName } from "../../../constants";

/**
 * Collection of potential targets to connect to by tabId.
 */
const targets = new Map<
	number,
	{ name: string; port: chrome.runtime.Port }[]
>();

function addToTarget(tabId: number, port: chrome.runtime.Port) {
	if (!targets.has(tabId)) {
		targets.set(tabId, []);
	}
	const listeners = targets.get(tabId)!;

	if (listeners.every(l => l.name !== port.name)) {
		listeners.push({
			name: port.name,
			port,
		});
	}

	function emit(e: any) {
		console.log("emit", e, "listeners", listeners, port.name);
		listeners.forEach(l => {
			// Forward event to everyone, but ourselves
			if (l.name !== port.name) {
				debug(port.name, "->", l.name);
				l.port.postMessage(e);
			}
		});
	}

	port.onMessage.addListener(e => emit(e));
	port.onDisconnect.addListener(() => {
		emit({ type: "disconnect" });
		setPopupStatus(tabId, false);
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
	//

	port.onMessage.addListener(message => {
		console.log("<- ", message);
		addToTarget(message.tabId, port);
	});
}

/**
 * Each port will have a name that was specified during connection via
 * `chrome.runtime.connect()`. We leverage that to call the correct
 * handler.
 *
 * TODO: Allow 1:n connections
 */
const connectionHandlers: Record<
	string,
	(port: chrome.runtime.Port) => void
> = {
	[ContentScriptName]: handleContentScriptConnection,
	[DevtoolsPanelName]: handleDevtoolsConnection,
};

chrome.runtime.onConnect.addListener(port => {
	const handler = connectionHandlers[port.name];
	return handler && handler(port);
});

// export interface Connection {
// 	devtools: chrome.runtime.Port | null;
// 	contentScript: chrome.runtime.Port | null;
// 	removeListeners: () => void;
// }

// /**
//  * A map that keeps track of connections between devtools and contentScripts.
//  */
// const connections = new Map<number, Connection>();

// chrome.runtime.onConnect.addListener(port => {
// 	if (port.name === "preact-content-script") {
// 		if (port.sender?.tab?.id) {
// 			setPopupStatus(port.sender?.tab?.id, true);
// 		} else {
// 			debug("Could not detect sender from port.", port);
// 		}
// 	}

// 	// Don't inject into ourselves when our panel is opened as a tab.
// 	// Don't inject into native devtools
// 	// if (
// 	// 	port.sender?.tab?.url?.includes(chrome.runtime.id) ||
// 	// 	port.sender?.tab?.url?.startsWith("devtools://")
// 	// ) {
// 	// 	return;
// 	// }

// 	// Ok, so this is a little weird:
// 	// To be able to communicate from a content-script to the devtools panel
// 	// we need to always go through the brackground script. We basically just pass
// 	// the message along.

// 	let tab: number = -1;
// 	let name: keyof Connection;
// 	// If the name is a number, then it's an event coming from the devtools panel
// 	if (+port.name + "" === port.name) {
// 		name = "devtools";
// 		tab = +port.name;

// 		// Make sure to disconnect an existing content script before injecting a new one
// 		const existingConnection = connections.get(tab);
// 		if (existingConnection) existingConnection.removeListeners();
// 	} else {
// 		tab = port.sender!.tab!.id!;
// 		name = "contentScript";
// 	}

// 	console.log(tab, name, port);

// 	if (!connections.has(tab)) {
// 		connections.set(tab, {
// 			devtools: null,
// 			contentScript: null,
// 			removeListeners: () => null,
// 		});
// 	}

// 	const activeConn = connections.get(tab);
// 	(activeConn as Connection)[name] = port;

// 	// If both the content-script and the devtools are conncted we can start
// 	// setting up the message handlers
// 	if (activeConn && activeConn.contentScript && activeConn.devtools) {
// 		const { contentScript, devtools } = activeConn;

// 		console.log(
// 			"Establishing connection between devtools",
// 			devtools.name + " and contentScript ",
// 			contentScript.name,
// 		);

// 		const forwardToDevtools = (msg: any) => {
// 			// console.log("-> fwd to devtools ", devtools.name, msg);
// 			devtools.postMessage(msg);
// 		};
// 		contentScript.onMessage.addListener(forwardToDevtools);

// 		const forwardToContentScript = (msg: any) => {
// 			// console.log("-> fwd to content-script ", contentScript.name, msg);
// 			contentScript.postMessage(msg);
// 		};
// 		devtools.onMessage.addListener(forwardToContentScript);

// 		/**
// 		 * Disconnects the contentScript from the devtools.
// 		 *
// 		 * Note that this only calls disconnect on the contentScript as the
// 		 * devtools might be connected to another contentScript later.
// 		 *
// 		 * This method is called when the devtools connect the second time
// 		 * for a given tab and the old contentScript will be replaced by a
// 		 * fresh instance OR when the contentScript and/or the devtools
// 		 */
// 		activeConn.removeListeners = () => {
// 			contentScript.disconnect();
// 			contentScript.onMessage.removeListener(forwardToDevtools);
// 			devtools.onMessage.removeListener(forwardToContentScript);
// 		};

// 		/**
// 		 * Handler to shutdown the connection between devtools and contentScript
// 		 * fired when one of them was disconnected from the other end.
// 		 */
// 		const shutdown = () => {
// 			activeConn.removeListeners();
// 			devtools.disconnect();
// 			activeConn.contentScript = null;
// 			activeConn.devtools = null;
// 		};

// 		contentScript.onDisconnect.addListener(shutdown);
// 		devtools.onDisconnect.addListener(shutdown);

// 		// Notify that we're ready to accept events
// 		contentScript.postMessage({
// 			type: "initialized",
// 			data: null,
// 		});
// 	}
// });
