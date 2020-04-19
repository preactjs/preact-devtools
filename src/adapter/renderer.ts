import { VNode } from "preact";
import { ID } from "../view/store/types";
import { FilterState } from "./adapter/filter";
import { InspectData, UpdateType } from "./adapter/adapter";
import { DevtoolEvents } from "./hook";

export type ObjPath = Array<string | number>;

/**
 * TODO: Deprecate this
 */
export interface Renderer {
	refresh?(): void;
	getVNodeById(id: ID): VNode | null;
	getDisplayName(vnode: VNode): string;
	getDisplayNameById?(id: ID): string;
	findDomForVNode(id: ID): Array<HTMLElement | Text | null> | null;
	findVNodeIdForDom(node: HTMLElement | Text): number;
	applyFilters(filters: FilterState): void;
	has(id: ID): boolean;
	log(id: ID, children: ID[]): void;
	inspect(id: ID): InspectData | null;
	flushInitial(): void;
	forceUpdate(id: ID): void;
	update(id: ID, type: UpdateType, path: ObjPath, value: any): void;

	// Profiler
	startProfiling?(options: DevtoolEvents["start-profiling"]): void; // V2
	stopProfiling?(): void; // V2

	// Hooks
	updateHook?(id: ID, index: number, value: any): void; // V3
}

export enum Elements {
	HTML_ELEMENT = 1,
	CLASS_COMPONENT = 2,
	FUNCTION_COMPONENT = 3,
	FORWARD_REF = 4,
	MEMO = 5,
	SUSPENSE = 6,
}
