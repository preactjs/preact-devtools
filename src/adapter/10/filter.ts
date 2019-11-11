import { VNode, Fragment } from "preact";
import { getDisplayName, getVNodeParent } from "./vnode";

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

export interface RawFilterState {
	regex: string[];
	type: {
		fragment: boolean;
		dom: boolean;
	};
}

export function parseFilters(raw: RawFilterState): FilterState {
	const type = new Set<TypeFilterValue>();
	if (raw.type.fragment) type.add("fragment");
	if (raw.type.dom) type.add("dom");

	return {
		regex: [],
		type,
	};
}

export function shouldFilter(vnode: VNode, filters: FilterState): boolean {
	// Filter text nodes by default. They are too tricky to match
	// with the previous one...
	if (vnode.type == null) return true;

	if (typeof vnode.type === "function") {
		if (vnode.type === Fragment && filters.type.has("fragment")) {
			const parent = getVNodeParent(vnode);
			// Only filter non-root nodes
			if (parent != null) return true;

			return false;
		}
	} else if (
		(typeof vnode.type === "string" || vnode.type === null) &&
		filters.type.has("dom")
	) {
		return true;
	}

	if (filters.regex.length > 0) {
		const name = getDisplayName(vnode);
		return filters.regex.some(r => r.test(name));
	}

	return false;
}
