import { ID, AppCtx, useObserver } from ".";
import { valoo } from "../valoo";
import { useContext } from "preact/hooks";

/**
 * The Collapser deals with hiding sections in a tree view
 */
export function createCollapser() {
	let collapsed = valoo(new Set<ID>());

	let collapseNode = (id: ID, shouldCollapse: boolean) => {
		collapsed.update(s => {
			shouldCollapse ? s.add(id) : s.delete(id);
		});
	};

	let toggle = (id: ID) => collapseNode(id, !collapsed.$.has(id));

	return {
		collapsed,
		collapseNode,
		toggle,
	};
}

export function useCollapser() {
	let c = useContext(AppCtx).collapser;
	let collapsed = useObserver(() => c.collapsed.$);
	return { collapsed, collapseNode: c.collapseNode, toggle: c.toggle };
}
