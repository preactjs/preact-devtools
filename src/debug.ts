/**
 * Will be tree-shaken out in prod builds
 */
export function debug(...args: any[]) {
	if (import.meta.env.DEBUG) {
		// eslint-disable-next-line no-console
		console.log(...args);
	}
}
