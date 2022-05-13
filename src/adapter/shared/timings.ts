import { ID } from "../../view/store/types";

/**
 * Store timings in a Map instead of mutating the vnode for
 * performance.
 */
export interface VNodeTimings<T = ID> {
	start: Map<T, number>;
	end: Map<T, number>;
}

export function createVNodeTimings<T = ID>(): VNodeTimings<T> {
	return {
		start: new Map(),
		end: new Map(),
	};
}
