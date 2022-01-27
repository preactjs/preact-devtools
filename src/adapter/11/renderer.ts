import { ID } from "../../view/store/types";
import { Supports } from "../10/renderer";
import { DEFAULT_FIlTERS, FilterState } from "../adapter/filter";
import { PortPageHook } from "../adapter/port";
import { Renderer } from "../renderer";
import { Internal } from "./internal";
import { OptionsV11 } from "./options";

export interface Preact11Renderer extends Renderer {
	onCommit(internal: Internal): void;
	onUnmount(internal: Internal): void;
	updateHook(id: ID, index: number, value: any): void;
}

export function createV11Renderer(
	port: PortPageHook,
	namespace: number,
	options: OptionsV11,
	supports: Supports,
	filters: FilterState = DEFAULT_FIlTERS,
): Preact11Renderer {
	return {
		flushInitial() {},
	};
}
