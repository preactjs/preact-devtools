import { AppCtx } from "./react-bindings";
import { Observable } from "../preact-signals";
import { useContext } from "preact/hooks";

export interface Collapser<T> {
	collapsed: Observable<Set<T>>;
	toggle: (item: T) => void;
	collapseNode: (item: T, shouldCollapse: boolean) => void;
}

/**
 * The Collapser deals with hiding sections in a tree view
 */
export function createCollapser<T>(
	collapsed: Observable<Set<T>>,
): Collapser<T> {
	const collapseNode = (id: T, shouldCollapse: boolean) => {
		const s = collapsed.$;
		shouldCollapse ? s.add(id) : s.delete(id);
		collapsed.$ = new Set(s);
	};

	const toggle = (id: T) => collapseNode(id, !collapsed.$.has(id));

	return {
		collapsed,
		collapseNode,
		toggle,
	};
}

export function useCollapser() {
	const c = useContext(AppCtx).collapser;
	return {
		collapsed: c.collapsed.$,
		collapseNode: c.collapseNode,
		toggle: c.toggle,
	};
}
