import { ID } from "../view/store/types.ts";
import { FilterState } from "./adapter/filter.ts";
import { InspectData, UpdateType } from "./adapter/adapter.ts";
import { SharedVNode } from "./shared/bindings.ts";
import { VNodeTimings } from "./shared/timings.ts";
import { RenderReasonData } from "./shared/renderReasons.ts";
import { RootData } from "./shared/utils.ts";

export type ObjPath = Array<string | number>;

export interface Renderer<T extends SharedVNode = SharedVNode> {
	refresh?(): void;
	getVNodeById(id: ID): T | null;
	getDisplayName(vnode: T): string;
	findDomForVNode(id: ID): Array<HTMLElement | Text | null> | null;
	findVNodeIdForDom(node: HTMLElement | Text): number;
	applyFilters(filters: FilterState): void;
	log(id: ID, children: ID[]): void;
	inspect(id: ID): InspectData | null;
	update(id: ID, type: UpdateType, path: ObjPath, value: any): void;
	clear?(): void;
	onCommit(
		vnode: T,
		owners: Map<T, T>,
		timings: VNodeTimings<T>,
		renderReasons: Map<T, RenderReasonData> | null,
	): void;
	onUnmount(vnode: T): void;

	// Hooks
	updateHook?(id: ID, index: number, value: any): void; // V3
	// signals
	updateSignal?(id: ID, index: number, value: any): void; // V5

	// Component actions
	suspend?(id: ID, active: boolean): void; // V4

	// Get a list of root node mappings
	getRootMappings(): RootData[];
}

export function getRendererByVNodeId(
	renderers: Map<number, Renderer<SharedVNode>>,
	id: ID,
) {
	for (const r of renderers.values()) {
		if (r.getVNodeById(id) !== null) return r;
	}

	return null;
}
