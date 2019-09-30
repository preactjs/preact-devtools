import { AppCtx, useObserver } from ".";
import { valoo, Observable } from "../valoo";
import { useContext } from "preact/hooks";

export interface Collapser<T> {
	collapsed: Observable<Set<T>>;
	toggle: (item: T) => void;
	collapseNode: (item: T, shouldCollapse: boolean) => void;
	resetAll: () => void;
}

/**
 * The Collapser deals with hiding sections in a tree view
 */
export function createCollapser<T>(): Collapser<T> {
	let collapsed = valoo(new Set<T>());

	let collapseNode = (id: T, shouldCollapse: boolean) => {
		collapsed.update(s => {
			shouldCollapse ? s.add(id) : s.delete(id);
		});
	};

	let toggle = (id: T) => collapseNode(id, !collapsed.$.has(id));
	let resetAll = () =>
		collapsed.update(v => {
			v.clear();
		});

	return {
		resetAll,
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
