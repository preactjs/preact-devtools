import { VNode } from "preact";
import { ID } from "../view/store/types";
import { FilterState } from "./adapter/filter";
import { InspectData, UpdateType } from "./adapter/adapter";

export type ObjPath = Array<string | number>;

/**
 * TODO: Deprecate this
 */
export interface Renderer {
	refresh?(): void;
	getVNodeById(id: ID): VNode | null;
	getDisplayName(vnode: VNode): string;
	findDomForVNode(id: ID): Array<HTMLElement | Text | null> | null;
	findVNodeIdForDom(node: HTMLElement | Text): number;
	applyFilters(filters: FilterState): void;
	log(id: ID, children: ID[]): void;
	inspect(id: ID): InspectData | null;
	update(id: ID, type: UpdateType, path: ObjPath, value: any): void;
	clear?(): void;

	// Hooks
	updateHook?(id: ID, index: number, value: any): void; // V3

	// Component actions
	suspend?(id: ID, active: boolean): void; // V4
}

export function getRendererByVNodeId(renderers: Map<number, Renderer>, id: ID) {
	for (const r of renderers.values()) {
		if (r.getVNodeById(id) !== null) return r;
	}

	return null;
}
