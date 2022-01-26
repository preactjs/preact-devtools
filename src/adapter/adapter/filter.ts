import { RawFilter } from "../../view/store/filter";

export interface RawFilterState {
	regex: RawFilter[];
	type: {
		fragment: boolean;
		dom: boolean;
		hoc?: boolean;
	};
}

export type TypeFilterValue = "dom" | "fragment" | "hoc";

export interface FilterState {
	regex: RegExp[];
	type: Set<TypeFilterValue>;
}

export const DEFAULT_FIlTERS: FilterState = {
	regex: [],
	// TODO: Add default hoc-filter
	type: new Set(["dom", "fragment"]),
};

export function parseFilters(raw: RawFilterState): FilterState {
	const type = new Set<TypeFilterValue>();
	if (raw.type.fragment) type.add("fragment");
	if (raw.type.dom) type.add("dom");
	if (raw.type.hoc) type.add("hoc");

	return {
		regex: raw.regex.filter(x => x.enabled).map(x => new RegExp(x.value, "gi")),
		type,
	};
}
