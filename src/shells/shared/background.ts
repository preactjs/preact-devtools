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

let active = false;

chrome.runtime.onConnect.addListener(ev => {
	if (ev.sender && ev.sender.tab && ev.sender.tab.id) {
		active = true;
		activatePopup(ev.sender.tab.id);
	}
});

chrome.runtime.onMessage.addListener((msg, sender) => {
	if (!active && sender.tab && sender.tab.id && msg.hasPreact) {
		active = true;
		activatePopup(sender.tab.id);
	}
});
