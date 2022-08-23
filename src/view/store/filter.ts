import { signal } from "../valoo";
import { escapeStringRegexp } from "./utils";
import { RawFilterState, TypeFilterValue } from "../../adapter/adapter/filter";

export interface RawFilter {
	value: string;
	enabled: boolean;
}

export function createFilterStore(
	onSubmit: (event: "update-filter", filters: RawFilterState) => void,
) {
	const defaults = {
		fragment: true,
		dom: true,
		hoc: true,
		root: true,
		regex: [] as RawFilter[],
	};

	const filters = signal<RawFilter[]>(defaults.regex);
	const filterFragment = signal(defaults.fragment);
	const filterDom = signal(defaults.dom);
	const filterHoc = signal(defaults.hoc);
	const filterRoot = signal(defaults.root);

	const submit = () => {
		const s: RawFilterState = {
			regex: [],
			type: {
				fragment: filterFragment.value,
				dom: filterDom.value,
				hoc: filterHoc.value,
				root: filterRoot.value,
			},
		};

		filters.value.forEach(x => {
			s.regex.push({ value: escapeStringRegexp(x.value), enabled: x.enabled });
		});
		onSubmit("update-filter", s);
	};

	const restore = (state: RawFilterState) => {
		try {
			filterFragment.value = !!state.type.fragment;
			filterDom.value = !!state.type.dom;
			filterHoc.value = !!state.type.hoc;
			filterRoot.value = !!state.type.root;
			filters.value = state.regex;

			// Refetch component tree if filters are not the default ones
			if (
				defaults.fragment !== filterFragment.value ||
				defaults.dom !== filterDom.value ||
				defaults.hoc !== filterHoc.value ||
				defaults.root !== filterRoot.value ||
				filters.value.some(f => f.enabled)
			) {
				submit();
			}
		} catch (err) {
			// eslint-disable-next-line no-console
			console.log(err);
		}
	};

	return {
		filters,
		filterFragment,
		filterDom,
		filterHoc,
		filterRoot,
		setEnabled(filter: RawFilter | TypeFilterValue, v: boolean) {
			if (typeof filter === "string") {
				if (filter === "dom") {
					filterDom.value = v;
				} else if (filter === "fragment") {
					filterFragment.value = v;
				} else if (filter === "hoc") {
					filterHoc.value = v;
				} else if (filter === "root") {
					filterRoot.value = v;
				}
			} else {
				filter.enabled = v;
			}
			filters.update();
		},
		setValue(filter: RawFilter, value: string) {
			filter.value = value;
			filters.update();
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
			const idx = filters.value.indexOf(filter);
			if (idx > -1) {
				filters.update(v => {
					v.splice(idx, 1);
				});
			}
		},
		submit,
		restore,
	};
}
