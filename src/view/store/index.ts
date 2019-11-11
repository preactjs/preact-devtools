import { valoo, watch } from "../valoo";
import { createSearchStore } from "./search";
import { createModalState } from "../components/Modals";
import { createFilterStore } from "./filter";
import { flattenChildren } from "../components/tree/windowing";
import { createSelectionStore } from "./selection";
import { createCollapser } from "./collapser";
import { EmitFn } from "../../adapter/hook";
import { ID, DevNode, Store, Listener, Theme } from "./types";
import { InspectData } from "../../adapter/adapter/adapter";
import { debounce } from "../../shells/shared/utils";

export function createStore(): Store {
	let listeners: Array<null | Listener> = [];
	const notify: EmitFn = (name, data) => {
		listeners.forEach(fn => fn && fn(name, data));
	};

	const nodes = valoo<Map<ID, DevNode>>(new Map());
	const roots = valoo<ID[]>([]);

	// Toggle
	const isPicking = valoo<boolean>(false);

	const filterState = createFilterStore(notify);

	// List
	const collapser = createCollapser<ID>();
	const nodeList = watch(() => {
		return roots.$.map(root => {
			const list = flattenChildren<ID, DevNode>(
				nodes.$,
				root,
				collapser.collapsed.$,
			);

			if (filterState.filterFragment.$) {
				return list.slice(1);
			}

			return list;
		}).flat();
	});

	const inspectData = valoo<InspectData | null>(null);

	const selection = createSelectionStore(nodeList);

	// Update inspect data on selection
	selection.selected.on(id => {
		if (id > -1) {
			notify("inspect", id);
		} else {
			inspectData.$ = null;
		}
	});

	return {
		nodeList,
		inspectData,
		isPicking,
		roots,
		nodes,
		collapser,
		search: createSearchStore(nodes, nodeList),
		modal: createModalState(),
		filter: filterState,
		selection,
		theme: valoo<Theme>("auto"),
		actions: {
			highlightNode: debounce(id => notify("highlight", id), 100),
			clear() {
				nodes.$ = new Map();
				roots.$ = [];
				selection.selected.$ = -1;
				collapser.collapsed.$ = new Set();
				listeners = [];
			},
			startPickElement() {
				isPicking.$ = true;
				notify("start-picker", null);
			},
			stopPickElement() {
				isPicking.$ = false;
				notify("stop-picker", null);
			},
		},
		subscribe(fn) {
			const idx = listeners.push(fn);
			return () => (listeners[idx] = null);
		},
		emit: notify,
	};
}
