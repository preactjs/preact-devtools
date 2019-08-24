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
		popup: "popups/enabled.html",
	});
}

chrome.runtime.onMessage.addListener((msg, sender) => {
	if (sender.tab && sender.tab.id && msg.hasPreact) {
		activatePopup(sender.tab.id);
	}
});
