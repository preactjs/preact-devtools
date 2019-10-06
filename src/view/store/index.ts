import { createContext } from "preact";
import { useContext, useState, useEffect } from "preact/hooks";
import { valoo, Observable, watch } from "../valoo";
import { createSearchStore } from "./search";
import { createModalState } from "../components/Modals";
import { createFilterStore } from "./filter";
import { flattenChildren } from "../components/tree/windowing";
import { createSelectionStore } from "./selection";
import { createCollapser, Collapser } from "./collapser";
import { EmitFn } from "../../adapter/hook";
import { InspectData } from "../../adapter/adapter";

export type ID = number;

export enum DevNodeType {
	FunctionComponent,
	ClassComponent,
	Element,
	ForwardRef,
	Memo,
	Context,
	Consumer,
	Suspense,
}

export interface DevNode {
	id: ID;
	type: DevNodeType;
	name: string;
	key: string;
	parent: ID;
	children: ID[];

	// Profiling
	duration: Observable<number>;

	// Display properties
	depth: number;
}

export type Tree = Map<ID, DevNode>;

export interface Store {
	isPicking: Observable<boolean>;
	inspectData: Observable<InspectData | null>;
	roots: Observable<ID[]>;
	rootToChild: Observable<Map<number, number>>;
	nodes: Observable<Tree>;
	nodeList: Observable<ID[]>;
	search: ReturnType<typeof createSearchStore>;
	modal: ReturnType<typeof createModalState>;
	filter: ReturnType<typeof createFilterStore>;
	selection: ReturnType<typeof createSelectionStore>;
	collapser: Collapser<ID>;
	actions: {
		highlightNode: (id: ID | null) => void;
		clear(): void;
		startPickElement(): void;
		stopPickElement(): void;
	};
	emit: EmitFn;
	subscribe(fn: Listener): () => void;
}

export type Listener = (name: string, data: any) => void;

export function createStore(): Store {
	let listeners: Array<null | Listener> = [];
	const notify: EmitFn = (name, data) => {
		listeners.forEach(fn => fn && fn(name, data));
	};

	const nodes = valoo<Tree>(new Map());
	const roots = valoo<ID[]>([]);
	const rootToChild = valoo<Map<any, any>>(new Map());

	// Toggle
	const isPicking = valoo<boolean>(false);

	const filterState = createFilterStore(notify);

	// List
	const collapser = createCollapser<ID>();
	const nodeList = watch(() => {
		const list = flattenChildren(
			nodes.$,
			rootToChild.$.get(1)!,
			collapser.collapsed.$,
		);

		if (filterState.filterFragment.$) {
			return list.slice(1);
		}

		return list;
	});

	const inspectData = valoo(null);

	const selection = createSelectionStore(nodeList);

	return {
		nodeList,
		inspectData,
		isPicking,
		roots,
		rootToChild,
		nodes,
		collapser,
		search: createSearchStore(nodes, nodeList),
		modal: createModalState(),
		filter: filterState,
		selection,
		actions: {
			highlightNode: id => {
				if (id != null) notify("highlight", id);
			},
			clear() {
				nodes.$ = new Map();
				roots.$ = [];
				rootToChild.$ = new Map();
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

export const AppCtx = createContext<Store>(null as any);
export const EmitCtx = createContext<EmitFn>(() => null);

export const useEmitter = () => useContext(EmitCtx);
export const useStore = () => useContext(AppCtx);

export function useObserver<T>(fn: () => T): T {
	let [i, setI] = useState(0);

	useEffect(() => {
		let v = watch(fn);
		let disp = v.on(() => setI(i + 1));
		return () => {
			disp();
			v._disposers.forEach(disp => disp());
		};
	}, [fn]);

	return fn();
}
