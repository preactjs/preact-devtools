export interface RawFilterState {
	regex: string[];
	type: {
		fragment: boolean;
		dom: boolean;
	};
}

export type TypeFilterValue = "dom" | "fragment";

export interface FilterState {
	regex: RegExp[];
	type: Set<TypeFilterValue>;
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
