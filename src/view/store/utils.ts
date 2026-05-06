import { ID } from "./types";

// See: https://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
export function escapeStringRegexp(string: string) {
	return string.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
}

export function sameIds(a: ID[], b: ID[]) {
	if (a.length !== b.length) return false;
	for (let i = 0; i < a.length; i++) {
		if (a[i] !== b[i]) return false;
	}
	return true;
}
