import { Store } from "../../../view/store/types";

/**
 * Load the theme from the browser private extension storage. This
 * storage is bound to the user profile and may be synced by the
 * browser.
 */
export async function loadTheme(window: Window, store: Store) {
	const doc = window.document;
	doc.body.classList.add((chrome.devtools.panels as any).themeName || "light");
	try {
		// Load theme
		const theme = await new Promise(res => {
			chrome.storage.sync.get(["theme"], result => res(result.theme));
		});

		if (theme) {
			store.theme.$ = theme as any;
		}
	} catch (e) {
		// We don't really care if we couldn't load the theme
		console.error(e);
	}
}

/**
 * Save theme into user storage (bound to user profile).
 */
export function storeTheme(theme: string) {
	try {
		chrome.storage.sync.set({ theme });
	} catch (e) {
		// Storing the theme is not a critical operation, so we'll
		// just log the error and continue
		console.error(e);
	}
}
