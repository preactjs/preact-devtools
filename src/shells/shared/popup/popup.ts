// This file is not included at runtime. It is only used by
// the background page to activate or deactivate the icon

import { debug } from "../../../debug";

export function setPopupStatus(tabId: number, enabled?: boolean) {
	debug("Popup", `${enabled ? "Enable" : "Disable"} popup`);
	const suffix = enabled ? "" : "-disabled";
	chrome.browserAction.setIcon({
		tabId,
		path: {
			"16": `icons/icon-16${suffix}.png`,
			"32": `icons/icon-32${suffix}.png`,
			"48": `icons/icon-48${suffix}.png`,
			"128": `icons/icon-128${suffix}.png`,
			"192": `icons/icon-192${suffix}.png`,
		},
	});
	chrome.browserAction.setPopup({
		tabId,
		popup: `popup/${enabled ? "enabled" : "disabled"}.html`,
	});
}