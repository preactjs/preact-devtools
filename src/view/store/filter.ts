import { valoo } from "../valoo";
import { RawFilterState } from "../../adapter/10/filter";
import escapeStringRegexp from "escape-string-regexp";

export interface RawFilter {
	value: string;
	enabled: boolean;
}

export function createFilterStore(
	onSubmit: (event: string, filters: RawFilterState) => void,
) {
	const filters = valoo<RawFilter[]>([]);
	const filterFragment = valoo(true);
	const filterDom = valoo(true);

	const submit = () => {
		let s: RawFilterState = {
			regex: [],
			type: {
				fragment: filterFragment.$,
				dom: filterDom.$,
			},
		};

		filters.$.filter(x => x.enabled).forEach(x => {
			s.regex.push(escapeStringRegexp(x.value));
		});
		onSubmit("update-filter", s);
	};

	return {
		filters,
		filterFragment,
		filterDom,
		setEnabled(filter: RawFilter | string, v: boolean) {
			if (typeof filter === "string") {
				if (filter === "dom") {
					filterDom.$ = v;
				} else if (filter === "fragment") {
					filterFragment.$ = v;
				}
			} else {
				filter.enabled = v;
			}
			filters.update();
			submit();
		},
		setValue(filter: RawFilter, value: string) {
			filter.value = value;
			filters.update();
			submit();
		},
		add() {
			filters.update(v => {
				v.push({
					value: "",
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
