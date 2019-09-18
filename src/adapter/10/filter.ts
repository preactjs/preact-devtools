import { VNode, Fragment } from "preact";
import { getDisplayName } from "./vnode";

export interface RegexFilter {
	type: "name";
	value: string;
}

export interface TypeFilter {
	type: "type";
	value: TypeFilterValue;
}

export type TypeFilterValue = "dom" | "fragment";
export type Filter = RegexFilter | TypeFilter;

export interface FilterState {
	regex: RegExp[];
	type: Set<TypeFilterValue>;
}

export function shouldFilter(vnode: VNode, filters: FilterState): boolean {
	if (typeof vnode.type === "function") {
		if (vnode.type === Fragment && filters.type.has("fragment")) {
			return true;
		}
	} else if (typeof vnode.type === "string") {
		if (filters.type.has("dom")) return true;
	} else if (filters.type.has("dom") && vnode.type === null) {
		return true;
	}

	const name = getDisplayName(vnode);
	return filters.regex.some(r => r.test(name));
}
