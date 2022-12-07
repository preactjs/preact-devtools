/**
 * Will be tree-shaken out in prod builds
 */
export function debug(...args: any[]) {
	// if (process.env.DEBUG) {
	if (true) {
		// eslint-disable-next-line no-console
		console.log(...args);
	}
}
