import { ID, Store } from "../../store";
import { valoo } from "../../valoo";

export function createWindowing(
	selected: Store["selected"],
	nodes: Store["nodeList"],
) {
	const getRelativeId = (n: number): ID => {
		const sel = selected.$;
		const items = nodes.$;

		const needle = sel ? sel.id : items.length > 0 ? items[0] : -1;
		if (needle > -1) {
			let idx = items.findIndex(id => needle === id);
			idx = Math.max(0, Math.min(idx + n, items.length - 1));
			return items[idx]!;
		}
		return -1;
	};

	return {
		getRelativeId,
	};
}

/**
 * The Collapser deals with hiding sections in a tree view
 */
export function createCollapser() {
	let collapsed = valoo(new Set<ID>());

	let collapse = (id: ID, shouldCollapse: boolean) => {
		collapsed.update(s => {
			shouldCollapse ? s.delete(id) : s.add(id);
		});
	};

	let toggle = (id: ID) => collapse(id, !collapsed.$.has(id));

	return {
		collapsed,
		collapse,
		toggle,
	};
}
