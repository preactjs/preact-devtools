import { valoo, watch } from "../valoo";
import { createSearchStore } from "./search";
import { createFilterStore } from "./filter";
import { flattenChildren } from "../components/tree/windowing";
import { createSelectionStore } from "./selection";
import { createCollapser } from "./collapser";
import { EmitFn } from "../../adapter/hook";
import { ID, DevNode, Store, Listener, Theme } from "./types";
import { InspectData } from "../../adapter/adapter/adapter";
import { createProfiler } from "../components/profiler/data/commits";

export function createStore(): Store {
	const listeners: Array<null | Listener> = [];
	const notify: EmitFn = (name, data) => {
		listeners.forEach(fn => fn && fn(name, data));
	};

	const nodes = valoo<Map<ID, DevNode>>(new Map());
	const roots = valoo<ID[]>([]);

	// Toggle
	const isPicking = valoo<boolean>(false);
	const filterState = createFilterStore(notify);

	// List
	const collapsed = valoo(new Set<ID>());
	const collapser = createCollapser<ID>(collapsed);
	const treeDepth = valoo<number>(0);

	const nodeList = watch(() => {
		return roots.$.map(root => {
			const { items, maxDepth } = flattenChildren<ID, DevNode>(
				nodes.$,
				root,
				id => collapser.collapsed.$.has(id),
			);

			if (filterState.filterFragment.$) {
				if (maxDepth - 1 > treeDepth.$) {
					treeDepth.$ = maxDepth - 1;
				}
				return items.slice(1);
			}

			if (maxDepth > treeDepth.$) {
				treeDepth.$ = maxDepth;
			}

			return items;
		}).flat();
	});

	// Sidebar
	const inspectData = valoo<InspectData | null>(null);
	const sidebarUncollapsed = valoo<string[]>([]);

	const selection = createSelectionStore(nodeList);

	return {
		profiler: createProfiler(notify),
		notify,
		nodeList,
		inspectData,
		isPicking,
		roots,
		nodes,
		collapser,
		treeDepth,
		search: createSearchStore(nodes, nodeList),
		filter: filterState,
		selection,
		theme: valoo<Theme>("auto"),
		sidebarUncollapsed,
		clear() {
			roots.$ = [];
			nodes.$ = new Map();
			selection.selected.$ = -1;
			collapser.collapsed.$ = new Set();
		},
		subscribe(fn) {
			const idx = listeners.push(fn);
			return () => (listeners[idx] = null);
		},
		emit: notify,
	};
}
