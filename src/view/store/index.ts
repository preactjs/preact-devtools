import { signal, effect } from "@preact/signals";
import { createSearchStore } from "./search";
import { createFilterStore } from "./filter";
import { createSelectionStore } from "./selection";
import { createCollapser } from "./collapser";
import { EmitFn } from "../../adapter/hook";
import { ID, DevNode, Store, Listener, Theme, Panel } from "./types";
import { InspectData } from "../../adapter/adapter/adapter";
import { createProfiler } from "../components/profiler/data/commits";
import { PropData } from "../components/sidebar/inspect/parseProps";
import { parseObjectState, filterCollapsed } from "./props";
import { TreeStore } from "./tree";
import type { OperationV3State } from "../../adapter/protocol/v3";

export function createStore(): Store {
	const listeners: Array<null | Listener> = [];
	const notify: EmitFn = (name, data) => {
		listeners.forEach(fn => fn && fn(name, data));
	};

	const debugMode = signal(!!__DEBUG__);

	const nodes = signal<Map<ID, DevNode>>(new Map());
	const roots = signal<ID[]>([]);
	const tree = new TreeStore();
	const operationV3 = new Map<number, OperationV3State>();
	const rendererByNode = new Map<ID, number>();

	// Toggle
	const isPicking = signal<boolean>(false);
	const filterState = createFilterStore(notify);
	effect(() => {
		tree.setRootHidden(filterState.filterRoot.value);
	});

	const collapsed = signal(new Set<ID>());
	const collapser = createCollapser<ID>(collapsed, (id, shouldCollapse) => {
		tree.setCollapsed(id, shouldCollapse);
	});

	// Sidebar
	const sidebar = {
		props: {
			uncollapsed: signal<string[]>([]),
			items: signal<PropData[]>([]),
		},
		state: {
			uncollapsed: signal<string[]>([]),
			items: signal<PropData[]>([]),
		},
		context: {
			uncollapsed: signal<string[]>([]),
			items: signal<PropData[]>([]),
		},
		hooks: {
			uncollapsed: signal<string[]>([]),
			items: signal<PropData[]>([]),
		},
		signals: {
			uncollapsed: signal<string[]>([]),
			items: signal<PropData[]>([]),
		},
	};

	const inspectData = signal<InspectData | null>(null);

	effect(() => {
		const props = inspectData.value ? inspectData.value.props : null;
		sidebar.props.items.value = parseObjectState(
			props,
			sidebar.props.uncollapsed.value,
		);

		const state = inspectData.value ? inspectData.value.state : null;
		sidebar.state.items.value = parseObjectState(
			state,
			sidebar.state.uncollapsed.value,
		);

		const context = inspectData.value ? inspectData.value.context : null;
		sidebar.context.items.value = parseObjectState(
			context,
			sidebar.context.uncollapsed.value,
		);

		const signals = inspectData.value ? inspectData.value.signals : null;
		sidebar.signals.items.value = parseObjectState(
			signals,
			sidebar.signals.uncollapsed.value,
		);
	});

	const supportsHooks = signal(false);
	effect(() => {
		if (supportsHooks.value) {
			const items =
				inspectData.value && inspectData.value.hooks
					? inspectData.value.hooks
					: [];
			sidebar.hooks.items.value = filterCollapsed(
				items,
				sidebar.hooks.uncollapsed.value,
			).slice(1);
		}
	});

	const selection = createSelectionStore(tree);
	const stats = signal(null);

	return {
		supports: {
			hooks: supportsHooks,
		},
		stats: {
			isRecording: signal(false),
			data: stats,
		},
		debugMode,
		activePanel: signal(Panel.ELEMENTS),
		profiler: createProfiler(),
		notify,
		inspectData,
		isPicking,
		roots,
		nodes,
		tree,
		operationV3,
		rendererByNode,
		collapser,
		search: createSearchStore(tree),
		filter: filterState,
		selection,
		theme: signal<Theme>("auto"),
		sidebar,
		clear() {
			roots.value = [];
			nodes.value = new Map();
			tree.clear();
			operationV3.clear();
			rendererByNode.clear();
			selection.selected.value = -1;
			collapser.collapsed.value = new Set();
			stats.value = null;
			inspectData.value = null;
		},
		subscribe(fn) {
			const idx = listeners.push(fn);
			return () => (listeners[idx] = null);
		},
		emit: notify,
	};
}
