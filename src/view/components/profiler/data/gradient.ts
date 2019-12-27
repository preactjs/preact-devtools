import { normalize } from "../flamegraph/FlamegraphStore";

export function getGradient(n: number) {
	const max = 9; // Amount of colors, see css variables
	let i = 0;
	if (!isNaN(n)) {
		if (!isFinite(n)) {
			i = max;
		} else {
			i = Math.round(normalize(max, 0, n));
		}
	}

	return i;
}
