import { valoo, watch } from "../valoo";
import { createSearchStore } from "./search";
import { createFilterStore } from "./filter";
import { flattenChildren } from "../components/tree/windowing";
import { createSelectionStore } from "./selection";
import { createCollapser } from "./collapser";
import { EmitFn } from "../../adapter/hook";
import { ID, DevNode, Store, Listener, Theme, Panel } from "./types";
import { InspectData } from "../../adapter/adapter/adapter";
import { createProfiler } from "../components/profiler/data/commits";
import { PropData } from "../components/sidebar/inspect/parseProps";
import { parseObjectState, filterCollapsed } from "./props";

export function createStore(): Store {
	const listeners: Array<null | Listener> = [];
	const notify: EmitFn = (name, data) => {
		listeners.forEach(fn => fn && fn(name, data));
	};

	const debugMode = valoo(!!process.env.DEBUG);

	const nodes = valoo<Map<ID, DevNode>>(new Map());
	const roots = valoo<ID[]>([]);

	// Toggle
	const isPicking = valoo<boolean>(false);
	const filterState = createFilterStore(notify);

	// List
	const collapsed = valoo(new Set<ID>());
	const collapser = createCollapser<ID>(collapsed);

	const nodeList = watch(() => {
		return roots.$.map(root => {
			const items = flattenChildren<ID, DevNode>(nodes.$, root, id =>
				collapser.collapsed.$.has(id),
			);

			if (filterState.filterRoot.$) {
				return items.slice(1);
			}

			return items;
		}).reduce((acc, val) => acc.concat(val), []);
	});

	// Sidebar
	const sidebar = {
		props: {
			uncollapsed: valoo<string[]>([]),
			items: valoo<PropData[]>([]),
		},
		state: {
			uncollapsed: valoo<string[]>([]),
			items: valoo<PropData[]>([]),
		},
		context: {
			uncollapsed: valoo<string[]>([]),
			items: valoo<PropData[]>([]),
		},
		hooks: {
			uncollapsed: valoo<string[]>([]),
			items: valoo<PropData[]>([]),
		},
	};

	const inspectData = valoo<InspectData | null>(null);

	watch(() => {
		const data = inspectData.$ ? inspectData.$.props : null;
		sidebar.props.items.$ = parseObjectState(data, sidebar.props.uncollapsed.$);
	});
	watch(() => {
		const data = inspectData.$ ? inspectData.$.state : null;
		sidebar.state.items.$ = parseObjectState(data, sidebar.state.uncollapsed.$);
	});
	watch(() => {
		const data = inspectData.$ ? inspectData.$.context : null;
		sidebar.context.items.$ = parseObjectState(
			data,
			sidebar.context.uncollapsed.$,
		);
	});

	const supportsHooks = valoo(false);
	watch(() => {
		if (supportsHooks) {
			const items =
				inspectData.$ && inspectData.$.hooks ? inspectData.$.hooks : [];
			sidebar.hooks.items.$ = filterCollapsed(
				items,
				sidebar.hooks.uncollapsed.$,
			).slice(1);
		}
	});

	const selection = createSelectionStore(nodeList);
	const stats = valoo(null);

	return {
		supports: {
			hooks: supportsHooks,
		},
		stats: {
			isRecording: valoo(false),
			data: stats,
		},
		debugMode,
		activePanel: valoo(Panel.ELEMENTS),
		profiler: createProfiler(),
		notify,
		nodeList,
		inspectData,
		isPicking,
		roots,
		nodes,
		collapser,
		search: createSearchStore(nodes, nodeList),
		filter: filterState,
		selection,
		theme: valoo<Theme>("auto"),
		sidebar,
		clear() {
			roots.$ = [];
			nodes.$ = new Map();
			selection.selected.$ = -1;
			collapser.collapsed.$ = new Set();
			stats.$ = null;
		},
		subscribe(fn) {
			const idx = listeners.push(fn);
			return () => (listeners[idx] = null);
		},
		emit: notify,
	};
}
