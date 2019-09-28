import { valoo } from "../valoo";
import { FilterState } from "../../adapter/10/filter";

export interface RawFilter {
	type: string;
	value: string;
	enabled: boolean;
}

const INITIAL_FILTERS: RawFilter = {
	type: "type",
	value: "dom",
	enabled: true,
};

export function createFilterStore(
	onSubmit: (event: string, filters: FilterState) => void,
) {
	const filters = valoo<RawFilter[]>([INITIAL_FILTERS]);

	return {
		filters,
		submit() {
			let s: FilterState = {
				regex: [],
				type: new Set(),
			};
			filters.$.filter(x => x.enabled).forEach(x => {
				if (x.type === "type") {
					s.type.add(x.value as any);
				} else {
					// TODO: Escape
					s.regex.push(new RegExp(x.value, "ig"));
				}
			});
			onSubmit("update-filter", s);
		},
		setEnabled(filter: RawFilter, v: boolean) {
			filter.enabled = v;
			filters.update();
		},
		setType(filter: RawFilter, type: "type" | "name") {
			if (filter.type !== type) {
				filter.value = type === "type" ? "dom" : "";
			}
			filter.type = type;
			filters.update();
		},
		setValue(filter: RawFilter, value: string) {
			filter.value = value;
			filters.update();
		},
		add() {
			filters.update(v => {
				v.push({
					type: "type",
					value: "dom",
					enabled: false,
				});
			});
		},
		remove(filter: RawFilter) {
			const idx = filters.$.indexOf(filter);
			if (idx > -1) {
				filters.update(v => {
					v.splice(idx, 1);
				});
			}
		},
	};
}
