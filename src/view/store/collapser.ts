import { AppCtx } from "./react-bindings";
import { useContext } from "preact/hooks";

export interface Collapser<T> {
	isCollapsed: (item: T) => boolean;
	toggle: (item: T) => void;
	collapseNode: (item: T, shouldCollapse: boolean) => void;
}

/**
 * The Collapser deals with hiding sections in a tree view
 */
export function createCollapser<T>(
	isCollapsed: (item: T) => boolean,
	onChange: (item: T, collapsed: boolean) => void,
): Collapser<T> {
	const collapseNode = (id: T, shouldCollapse: boolean) => {
		onChange(id, shouldCollapse);
	};

	const toggle = (id: T) => collapseNode(id, !isCollapsed(id));

	return {
		isCollapsed,
		collapseNode,
		toggle,
	};
}

export function useCollapser() {
	const store = useContext(AppCtx);
	const c = store.collapser;
	store.tree.structureVersion.value;
	return {
		collapsed: { has: c.isCollapsed },
		collapseNode: c.collapseNode,
		toggle: c.toggle,
	};
}
