// This file is not included at runtime. It is only used by
// the background page to activate or deactivate the icon

import { debug } from "../../../debug";
import { isFirefox } from "../utils";

const IS_FIREFOX = isFirefox();
function getUrl(url: string) {
	if (IS_FIREFOX) return url;
	return chrome.runtime.getURL(url);
}

export function setPopupStatus(tabId: number, enabled?: boolean) {
	const status = enabled ? "enabled" : "disabled";
	debug(
		`[${tabId}] %cPopup: %c${status}`,
		"font-weight: bold",
		"font-weight: normal",
	);
	const suffix = enabled ? "" : "-disabled";

	(IS_FIREFOX ? chrome.browserAction : chrome.action).setIcon({
		tabId,
		path: {
			"16": getUrl(`icons/icon-16${suffix}.png`),
			"32": getUrl(`icons/icon-32${suffix}.png`),
			"48": getUrl(`icons/icon-48${suffix}.png`),
			"128": getUrl(`icons/icon-128${suffix}.png`),
			"192": getUrl(`icons/icon-192${suffix}.png`),
		},
	});
	(IS_FIREFOX ? chrome.browserAction : chrome.action).setPopup({
		tabId,
		popup: getUrl(`popup/${status}.html`),
	});
}
