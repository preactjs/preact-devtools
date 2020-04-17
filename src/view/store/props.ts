import { Observable, valoo, watch } from "../valoo";
import { PropData, parseProps } from "../components/sidebar/inspect/parseProps";
import { InspectData } from "../../adapter/adapter/adapter";
import { flattenChildren } from "../components/tree/windowing";
import { ID } from "./types";

const PROPS_LIMIT = 7;
function parseInspectData(
	v: InspectData | null,
	tree: Observable<Map<string, PropData>>,
	getData: (data: InspectData) => any,
	uncollapsed: Observable<string[]>,
	state: { lastId: ID },
) {
	if (v != null) {
		tree.$.set("root", {
			collapsable: false,
			children: [],
			depth: 0,
			editable: false,
			id: "root",
			type: "object",
			value: null,
		});

		if (state.lastId !== v.id) {
			state.lastId = v.id;
			uncollapsed.$ = [];
		}

		parseProps(getData(v), "root", PROPS_LIMIT, tree.$);
	} else {
		tree.$.clear();
	}

	tree.update();
}

export function isCollapsed(ids: string[], id: string) {
	return id !== "root" && ids.indexOf(id) === -1;
}

export function createPropsStore(
	inspectData: Observable<InspectData | null>,
	uncollapsed: Observable<string[]>,
	getData: (data: InspectData) => any,
) {
	const tree = valoo(new Map<string, PropData>());
	const state = {
		lastId: inspectData.$ ? inspectData.$.id : -1,
	};

	// Whenever the inspection data changes, we'll update the tree
	const dispose = inspectData.on(
		v => {
			return parseInspectData(v, tree, getData, uncollapsed, state);
		},
		{ init: true },
	);

	const list = watch(() => {
		const { items } = flattenChildren(tree.$, "root", id => {
			return tree.$.get(id)!.collapsable && isCollapsed(uncollapsed.$, id);
		});
		return items.slice(1);
	});

	return { list, uncollapsed, tree, destroy: () => dispose() };
}

export function toggleCollapsed(uncollapsed: Observable<string[]>, id: string) {
	const idx = uncollapsed.$.indexOf(id);
	if (idx > -1) {
		uncollapsed.$.splice(idx, 1);
	} else {
		uncollapsed.$.push(id);
	}
	uncollapsed.update();
}
