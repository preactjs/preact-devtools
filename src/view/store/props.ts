import { Observable, valoo, watch } from "../valoo";
import { PropData, parseProps } from "../components/sidebar/inspect/parseProps";
import { InspectData } from "../../adapter/adapter/adapter";
import { flattenChildren } from "../components/tree/windowing";

const PROPS_LIMIT = 7;

export function createPropsStore(
	inspectData: Observable<InspectData | null>,
	getData: (data: InspectData) => any,
) {
	const uncollapsed = valoo<string[]>([]);
	const tree = valoo(new Map<string, PropData>());
	let lastId = inspectData.$ ? inspectData.$.id : -1;

	// Whenever the inspection data changes, we'll update the tree
	const dispose = inspectData.on(v => {
		if (v != null) {
			tree.$.set("root", {
				collapsable: false,
				children: [],
				depth: 0,
				editable: false,
				id: "root",
				path: ["root"],
				type: "object",
				value: null,
			});

			if (lastId !== v.id) {
				lastId = v.id;
				uncollapsed.$ = [];
			}

			parseProps(getData(v), ["root"], PROPS_LIMIT, data => data, tree.$);
		} else {
			tree.$.clear();
		}

		tree.update();
	});

	const list = watch(() => {
		const { items } = flattenChildren(tree.$, "root", id => {
			return (
				tree.$.get(id)!.collapsable &&
				isCollapsed(uncollapsed.$, id) &&
				uncollapsed.$.indexOf(id) === -1
			);
		});
		return items.slice(1);
	});

	return { list, uncollapsed, tree, destroy: () => dispose() };
}

export function isCollapsed(ids: string[], id: string) {
	return id !== "root" && ids.indexOf(id) === -1;
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
