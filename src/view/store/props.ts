import { Observable, valoo, watch } from "../valoo";
import { PropData, parseProps } from "../parseProps";
import { createCollapser } from "./collapser";
import { InspectData } from "../../adapter/adapter";
import { EmitFn } from "../../adapter/hook";
import { flattenChildren } from "../components/tree/windowing";
import { ID } from "./types";

const PROPS_LIMIT = 7;

export function createPropsStore(
	inspectData: Observable<InspectData | null>,
	selected: Observable<ID>,
	notify: EmitFn,
) {
	const collapser = createCollapser<string>();
	const tree = valoo(new Map<string, PropData>());
	let initial = true;

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
			parseProps(v.props, ["root"], PROPS_LIMIT, tree.$);
		} else {
			tree.$.clear();
		}

		// Reset collapsed state when a new element is selected
		if (initial && tree.$.size > 0) {
			tree.$.forEach((v, id) => {
				if (id !== "root" && v.children.length > 0) {
					collapser.collapseNode(id, true);
				}
			});
			initial = false;
		}

		tree.update();
	});

	const list = watch(() => {
		const ids = flattenChildren(tree.$, "root", collapser.collapsed.$);
		return ids.slice(1);
	});

	// Whenever the selection changes we need to fire a request to
	// load the prop data for the sidebar
	watch(() => {
		tree.update(v => {
			v.clear();
		});

		initial = true;
		collapser.resetAll();
		inspectData.$ = null;

		if (selected.$ > -1) {
			notify("inspect", selected.$);
		}
	});

	return { list, collapser, tree };
}
