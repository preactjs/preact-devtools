import { Preact10Renderer, Supports } from "../10/renderer";
import { DEFAULT_FIlTERS, FilterState } from "../adapter/filter";
import { PortPageHook } from "../adapter/port";

export function createV11Renderer(
	port: PortPageHook,
	namespace: number,
	supports: Supports,
	filters: FilterState = DEFAULT_FIlTERS,
): Preact10Renderer {
	return {
		flushInitial() {},
	};
}
