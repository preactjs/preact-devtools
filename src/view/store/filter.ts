import { valoo } from "../valoo";
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

	const filters = valoo<RawFilter[]>(defaults.regex);
	const filterFragment = valoo(defaults.fragment);
	const filterDom = valoo(defaults.dom);
	const filterHoc = valoo(defaults.hoc);
	const filterRoot = valoo(defaults.root);

	const submit = () => {
		const s: RawFilterState = {
			regex: [],
			type: {
				fragment: filterFragment.$,
				dom: filterDom.$,
				hoc: filterHoc.$,
				root: filterRoot.$,
			},
		};

		filters.$.forEach(x => {
			s.regex.push({ value: escapeStringRegexp(x.value), enabled: x.enabled });
		});
		onSubmit("update-filter", s);
	};

	const restore = (state: RawFilterState) => {
		try {
			filterFragment.$ = !!state.type.fragment;
			filterDom.$ = !!state.type.dom;
			filterHoc.$ = !!state.type.hoc;
			filterRoot.$ = !!state.type.root;
			filters.$ = state.regex;

			// Refetch component tree if filters are not the default ones
			if (
				defaults.fragment !== filterFragment.$ ||
				defaults.dom !== filterDom.$ ||
				defaults.hoc !== filterHoc.$ ||
				defaults.root !== filterRoot.$ ||
				filters.$.some(f => f.enabled)
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
					filterDom.$ = v;
				} else if (filter === "fragment") {
					filterFragment.$ = v;
				} else if (filter === "hoc") {
					filterHoc.$ = v;
				} else if (filter === "root") {
					filterRoot.$ = v;
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
			const idx = filters.$.indexOf(filter);
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
