import { ID } from "../../view/store/types";

/**
 * Store timings in a Map instead of mutating the vnode for
 * performance.
 */
export interface VNodeTimings {
	start: Map<ID, number>;
	end: Map<ID, number>;
}

export function storeTime(timings: Map<ID, number>, id: ID, time: number) {
	timings.set(id, time);
}
