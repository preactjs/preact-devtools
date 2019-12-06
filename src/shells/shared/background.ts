export interface Connection {
	devtools: chrome.runtime.Port | null;
	contentScript: chrome.runtime.Port | null;
	removeListeners: () => void;
}

/**
 * A map that keeps track of connections between devtools and contentScripts.
 */
const connections = new Map<number, Connection>();

chrome.runtime.onConnect.addListener(port => {
	// Ok, so this is a little weird:
	// To be able to communicate from a content-script to the devtools panel
	// we need to always go through the brackground script. We basically just pass
	// the message along.

	let tab: number = -1;
	let name: keyof Connection;
	// If the name is a number, then it's an event coming from the devtools panel
	if (+port.name + "" === port.name) {
		name = "devtools";
		tab = +port.name;

		// Make sure to disconnect an existing content script before injecting a new one
		const existingConnection = connections.get(tab);
		if (existingConnection) existingConnection.removeListeners();

		installContentScript(tab);
	} else {
		tab = port.sender!.tab!.id!;
		name = "contentScript";
	}

	if (!connections.has(tab)) {
		connections.set(tab, {
			devtools: null,
			contentScript: null,
			removeListeners: () => null,
		});
	}

	const activeConn = connections.get(tab);
	(activeConn as any)[name] = port;

	// If both the content-script and the devtools are conncted we can start
	// setting up the message handlers
	if (activeConn && activeConn.contentScript && activeConn.devtools) {
		const { contentScript, devtools } = activeConn;

		console.log(
			"Establishing connection between devtools",
			devtools.name + " and contentScript ",
			contentScript.name,
		);

		const forwardToDevtools = (msg: any) => {
			console.log("-> fwd to devtools ", devtools.name, msg);
			devtools.postMessage(msg);
		};
		contentScript.onMessage.addListener(forwardToDevtools);

		const forwardToContentScript = (msg: any) => {
			console.log("-> fwd to content-script ", contentScript.name, msg);
			contentScript.postMessage(msg);
		};
		devtools.onMessage.addListener(forwardToContentScript);

		/**
		 * Disconnects the contentScript from the devtools.
		 *
		 * Note that this only calls disconnect on the contentScript as the
		 * devtools might be connected to another contentScript later.
		 *
		 * This method is called when the devtools connect the second time
		 * for a given tab and the old contentScript will be replaced by a
		 * fresh instance OR when the contentScript and/or the devtools
		 */
		activeConn.removeListeners = () => {
			contentScript.disconnect();
			contentScript.onMessage.removeListener(forwardToDevtools);
			devtools.onMessage.removeListener(forwardToContentScript);
		};

		/**
		 * Handler to shutdown the connection between devtools and contentScript
		 * fired when one of them was disconnected from the other end.
		 */
		const shutdown = () => {
			activeConn.removeListeners();
			devtools.disconnect();
			activeConn.contentScript = null;
			activeConn.devtools = null;
		};

		contentScript.onDisconnect.addListener(shutdown);
		devtools.onDisconnect.addListener(shutdown);

		// Notify that we're ready to accept events
		contentScript.postMessage({
			name: "initialized",
			payload: {
				ready: true,
			},
		});
	}
});

function activatePopup(tabId: number) {
	chrome.browserAction.setIcon({
		tabId,
		path: {
			"16": "icons/icon-16.png",
			"32": "icons/icon-32.png",
			"48": "icons/icon-48.png",
			"128": "icons/icon-128.png",
			"192": "icons/icon-192.png",
		},
	});
	chrome.browserAction.setPopup({
		tabId,
		popup: "popup/enabled.html",
	});
}

chrome.runtime.onMessage.addListener((port, sender) => {
	if (port.hasPreact && sender.tab && sender.tab.id) {
		activatePopup(sender.tab.id);
	}
});

function installContentScript(tabId: number) {
	chrome.tabs.executeScript(
		tabId,
		{ file: "/content-script.js" },
		function() {},
	);
}
