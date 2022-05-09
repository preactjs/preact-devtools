import { valoo } from "../valoo";
import escapeStringRegexp from "escape-string-regexp";
import { RawFilterState, TypeFilterValue } from "../../adapter/adapter/filter";

export interface RawFilter {
	value: string;
	enabled: boolean;
}

export function createFilterStore(
	onSubmit: (event: "update-filter", filters: RawFilterState) => void,
) {
	const filters = valoo<RawFilter[]>([]);
	const filterFragment = valoo(true);
	const filterDom = valoo(true);
	// TODO: Enable by default when it becomes stable. hoc-filter
	const filterHoc = valoo(false);
	const filterRoot = valoo(true);
	/** Enable experimental filters */
	const experimental = valoo(false);

	const submit = () => {
		const s: RawFilterState = {
			regex: [],
			type: {
				fragment: filterFragment.$,
				dom: filterDom.$,
				// TODO: Remove experimental check when it becomes stable. hoc-filter
				hoc: experimental.$ && filterHoc.$,
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
			// TODO: Disable experimental check once stable hoc-filter
			filterHoc.$ =
				state.type.hoc !== undefined && experimental.$ ? state.type.hoc : false;
			filterRoot.$ = state.type.root === true;
			filters.$ = state.regex;
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
		experimental,
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
