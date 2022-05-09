import { RawFilter } from "../../view/store/filter";

export interface RawFilterState {
	regex: RawFilter[];
	type: {
		fragment: boolean;
		dom: boolean;
		hoc?: boolean;
		root?: boolean;
	};
}

export type TypeFilterValue = "dom" | "fragment" | "hoc" | "root";

export interface FilterState {
	regex: RegExp[];
	type: Set<TypeFilterValue>;
}

export interface RegexFilter {
	type: "name";
	value: string;
}

export interface TypeFilter {
	type: "type";
	value: TypeFilterValue;
}

export type Filter = RegexFilter | TypeFilter;

export const DEFAULT_FIlTERS: FilterState = {
	regex: [],
	type: new Set(["dom", "fragment", "root", "hoc"]),
};

export function parseFilters(raw: RawFilterState): FilterState {
	const type = new Set<TypeFilterValue>();
	if (raw.type.fragment) type.add("fragment");
	if (raw.type.dom) type.add("dom");
	if (raw.type.hoc) type.add("hoc");
	if (raw.type.root) type.add("root");

	return {
		regex: raw.regex.filter(x => x.enabled).map(x => new RegExp(x.value, "gi")),
		type,
	};
}
