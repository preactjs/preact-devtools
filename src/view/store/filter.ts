import { valoo } from "../valoo";

export interface RawFilter {
	type: string;
	value: string;
	enabled: boolean;
}

export function createFilterStore() {
	const filters = valoo<RawFilter[]>([
		{
			type: "type",
			value: "dom",
			enabled: false,
		},
	]);

	return {
		filters,
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
			const idx = filters().indexOf(filter);
			if (idx > -1) {
				filters.update(v => {
					v.splice(idx, 1);
				});
			}
		},
	};
}
