import { Observable, watch } from "../valoo";
import { parseProps, PropData } from "../components/sidebar/inspect/parseProps";
import { InspectData } from "../../adapter/adapter/adapter";
import { flattenChildren } from "../components/tree/windowing";

const PROPS_LIMIT = 7;
function parseInspectData(
	v: InspectData | null,
	getData: (data: InspectData) => any,
) {
	const newTree = new Map<string, PropData>();
	if (v != null) {
		newTree.set("root", {
			children: [],
			depth: 0,
			editable: false,
			id: "root",
			type: "object",
			value: null,
		});

		parseProps(getData(v), "root", PROPS_LIMIT, newTree);
	}

	return newTree;
}

export function isCollapsed(ids: string[], id: string) {
	return id !== "root" && ids.indexOf(id) === -1;
}

export function createPropsStore(
	inspectData: Observable<InspectData | null>,
	uncollapsed: Observable<string[]>,
	getData: (data: InspectData) => any,
) {
	const list = watch(() => {
		const tree = parseInspectData(inspectData.$, getData);
		const { items } = flattenChildren(tree, "root", id => {
			return (
				tree.get(id)!.children.length > 0 && isCollapsed(uncollapsed.$, id)
			);
		});
		return items.slice(1).map(id => tree.get(id)!);
	});

	return { list, destroy: () => null };
}

export function toggleCollapsed(uncollapsed: Observable<string[]>, id: string) {
	const idx = uncollapsed.$.indexOf(id);
	uncollapsed.update(v => {
		idx > -1 ? v.splice(idx, 1) : v.push(id);
	});
}
