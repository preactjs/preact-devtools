import { Observable, valoo, watch } from "../valoo";
import { PropData, parseProps } from "../components/sidebar/parseProps";
import { createCollapser } from "./collapser";
import { InspectData } from "../../adapter/adapter/adapter";
import { flattenChildren } from "../components/tree/windowing";

const PROPS_LIMIT = 7;

export function createPropsStore(
	inspectData: Observable<InspectData | null>,
	getData: (data: InspectData) => any,
) {
	const collapsed = valoo(new Set<string>());
	const collapser = createCollapser<string>(collapsed);
	const tree = valoo(new Map<string, PropData>());

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

			const collapseAll = collapsed.$.size === 0;

			parseProps(
				getData(v),
				["root"],
				PROPS_LIMIT,
				data => {
					if (collapseAll && data.id !== "root" && data.collapsable) {
						collapsed.$.add(data.id);
					}
					return data;
				},
				tree.$,
			);
		} else {
			tree.$.clear();
		}

		collapsed.update();
		tree.update();
	});

	const list = watch(() => {
		const ids = flattenChildren(tree.$, "root", collapser.collapsed.$);
		return ids.slice(1);
	});

	return { list, collapser, tree, destroy: () => dispose() };
}
