import { VNode, Fragment } from "preact";
import { getDisplayName, getVNodeParent } from "./vnode";
import { TypeFilterValue, FilterState } from "../adapter/filter";
import { RendererConfig10 } from "./renderer";

export interface RegexFilter {
	type: "name";
	value: string;
}

export interface TypeFilter {
	type: "type";
	value: TypeFilterValue;
}

export type Filter = RegexFilter | TypeFilter;

export function shouldFilter(
	vnode: VNode,
	filters: FilterState,
	config: RendererConfig10,
): boolean {
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
		const name = getDisplayName(vnode, config);
		return filters.regex.some(r => {
			// Regexes with a global flag are stateful in JS :((
			r.lastIndex = 0;
			return r.test(name);
		});
	}

	return false;
}
