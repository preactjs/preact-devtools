import { createContext } from "preact";
import { useContext, useState, useEffect, useRef } from "preact/hooks";
import { valoo, Observable, watch } from "../valoo";
import { InspectData, UpdateType } from "../../adapter/adapter";
import { ObjPath } from "../components/ElementProps";
import { createSearchStore } from "./search";
import { createModalState } from "../components/Modals";
import { createFilterStore } from "./filter";
import { flattenChildren } from "../components/tree/windowing";
import { createSelectionStore } from "./selection";
import { createCollapser } from "./collapser";

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

const EMPTY_INSPECT: InspectData = {
	context: null,
	hooks: null,
	canEditState: false,
	canEditHooks: false,
	canEditProps: false,
	id: -1,
	name: ".",
	props: null,
	state: null,
	type: 2,
};

export interface Store {
	isPicking: Observable<boolean>;
	inspectData: Observable<InspectData>;
	roots: Observable<ID[]>;
	rootToChild: Observable<Map<number, number>>;
	nodes: Observable<Tree>;
	nodeList: Observable<ID[]>;
	search: ReturnType<typeof createSearchStore>;
	modal: ReturnType<typeof createModalState>;
	filter: ReturnType<typeof createFilterStore>;
	selection: ReturnType<typeof createSelectionStore>;
	collapser: ReturnType<typeof createCollapser>;
	actions: {
		highlightNode: (id: ID | null) => void;
		logNode: (id: ID) => void;
		updateNode: (id: ID, type: UpdateType, path: ObjPath, value: any) => void;
		updatePropertyName: (
			id: ID,
			type: UpdateType,
			path: ObjPath,
			value: any,
		) => void;
		clear(): void;
		startPickElement(): void;
		stopPickElement(): void;
	};
	subscribe(fn: Listener): () => void;
}

export type Listener = (name: string, data: any) => void;

export function createStore(): Store {
	let listeners: Array<null | Listener> = [];
	const notify: Listener = (name, data) => {
		listeners.forEach(fn => fn && fn(name, data));
	};

	const nodes = valoo<Tree>(new Map());
	const roots = valoo<ID[]>([]);
	const rootToChild = valoo<Map<any, any>>(new Map());

	// Toggle
	const inspectData = valoo<InspectData>(EMPTY_INSPECT);
	const isPicking = valoo<boolean>(false);

	// List
	const collapser = createCollapser();
	const nodeList = watch(() =>
		flattenChildren(nodes.$, rootToChild.$.get(1)!, collapser.collapsed.$),
	);

	const selection = createSelectionStore(nodeList, notify);
	return {
		nodeList,
		isPicking,
		inspectData,
		roots,
		rootToChild,
		nodes,
		collapser,
		search: createSearchStore(nodes, nodeList),
		modal: createModalState(),
		filter: createFilterStore(notify),
		selection,
		actions: {
			highlightNode: id => {
				notify("highlight", id);
			},
			logNode: id => {
				notify("log", id);
			},
			updateNode(id, type, path, value) {
				notify("update-node", { id, type, path, value });
				notify("inspect", id);
			},
			updatePropertyName(id, type, path, value) {
				console.log("TODO", path, value);
				// notify("update-node", { id, type, path, value });
				notify("inspect", id);
			},
			clear() {
				inspectData.$ = EMPTY_INSPECT;
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
	};
}

export const AppCtx = createContext<Store>(null as any);

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
