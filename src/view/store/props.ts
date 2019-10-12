import { Observable, valoo, watch } from "../valoo";
import { PropData, parseProps } from "../components/sidebar/parseProps";
import { createCollapser, Collapser } from "./collapser";
import { InspectData } from "../../adapter/adapter";
import { flattenChildren } from "../components/tree/windowing";
import { ID } from "./types";

const PROPS_LIMIT = 7;

export function createPropsStore(
	inspectData: Observable<InspectData | null>,
	selected: Observable<ID>,
	getData: (data: InspectData) => any,
	transform: (
		data: PropData,
		collapser: Collapser<string>,
		shouldReset: boolean,
	) => PropData,
) {
	const collapser = createCollapser<string>();
	const tree = valoo(new Map<string, PropData>());
	let lastId = -1;

	// Whenever the inspection data changes, we'll update the tree
	inspectData.on(v => {
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

			// Reset collapsed state when a new element is selected
			const shouldReset = lastId !== v.id && tree.$.size > 0;
			if (shouldReset) {
				collapser.collapsed.$.clear();
				lastId = v.id;
			}

			parseProps(
				getData(v),
				["root"],
				PROPS_LIMIT,
				data => {
					if (data.id !== "root") {
						transform(data, collapser, shouldReset);
					}
					return data;
				},
				tree.$,
			);
		} else {
			tree.$.clear();
			collapser.collapsed.$.clear();
		}

		collapser.collapsed.update();
		tree.update();
	});

	const list = watch(() => {
		const ids = flattenChildren(tree.$, "root", collapser.collapsed.$);
		return ids.slice(1);
	});

	return { list, collapser, tree };
}
