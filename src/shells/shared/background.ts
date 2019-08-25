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

export interface Connection {
	devtools: chrome.runtime.Port | null;
	contentScript: chrome.runtime.Port | null;
}

const conn = new Map<number, Connection>();
chrome.runtime.onConnect.addListener(port => {
	// Ok, so this is a little weird:
	// To be able to communicate from a content-script to the devtools panel
	// we need to always go through the brackground script. We basically just pass
	// the message along.

	let tab: number = -1;
	let name: keyof Connection = "contentScript";
	// If the name is a number, than it's an event coming from the devtools panel
	if (+port.name + "" === port.name) {
		name = "devtools";
		tab = +port.name;
	} else {
		tab = port.sender!.tab!.id!;
		name = "contentScript";
	}

	if (!conn.has(tab)) {
		conn.set(tab, { devtools: null, contentScript: null });
	}

	const activeConn = conn.get(tab);
	(activeConn as any)[name] = port;

	// If both the content-script and the devtools are conncted we can start
	// setting up the message handlers
	if (activeConn && activeConn.contentScript && activeConn.devtools) {
		const { contentScript, devtools } = activeConn;

		const forwardToDevtools = (msg: any) => devtools.postMessage(msg);
		contentScript.onMessage.addListener(forwardToDevtools);

		const forwardToContentScript = (msg: any) => contentScript.postMessage(msg);
		devtools.onMessage.addListener(forwardToContentScript);

		const shutdown = () => {
			contentScript.onMessage.removeListener(forwardToDevtools);
			devtools.onMessage.removeListener(forwardToContentScript);
			contentScript.disconnect();
			devtools.disconnect();
		};

		contentScript.onDisconnect.addListener(shutdown);
		devtools.onDisconnect.addListener(shutdown);
	}
});

let active = false;
chrome.runtime.onMessage.addListener(port => {
	// TODO: Don't do this for every message
	if (port.sender && port.sender.tab && port.sender.tab.id) {
		active = true;
		activatePopup(port.sender.tab.id);
	}
});
