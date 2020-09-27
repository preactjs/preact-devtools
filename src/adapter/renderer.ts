import { ID } from "../view/store/types";
import { FilterState } from "./adapter/filter";
import { InspectData, UpdateType } from "./adapter/adapter";
import { DevtoolEvents } from "./hook";

export type ObjPath = Array<string | number>;

export interface Supports {
	renderReasons?: boolean;
	hooks?: boolean;
	profiling?: boolean;
	statistics?: boolean;
}

export interface Renderer<T = any> {
	supports?: Supports;
	onCommit(vnode: T): void;
	onUnmount(vnode: T): void;
	refresh?(): void;
	getVNodeById(id: ID): T | null;
	getDisplayName(vnode: T): string;
	findDomForVNode(id: ID): Array<HTMLElement | Text | null> | null;
	findVNodeIdForDom(node: HTMLElement | Text): number | null;
	applyFilters(filters: FilterState): void;
	has(id: ID): boolean;
	log(id: ID, children: ID[]): void;
	inspect(id: ID): InspectData | null;
	flushInitial(): void;
	update(id: ID, type: UpdateType, path: ObjPath, value: any): void;
	clear?(): void;

	// Profiler
	startProfiling?(options: DevtoolEvents["start-profiling"]): void; // V2
	stopProfiling?(): void; // V2
	startHighlightUpdates?(): void;
	stopHighlightUpdates?(): void;

	// Stats
	startRecordStats?(): void; // V4
	stopRecordStats?(): void; // V4

	// Hooks
	updateHook?(id: ID, index: number, value: any): void; // V3

	// Component actions
	suspend?(id: ID, active: boolean): void; // V4
}
