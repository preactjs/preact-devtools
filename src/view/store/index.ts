import { createContext } from "preact";
import { useContext, useState, useEffect, useRef } from "preact/hooks";
import { valoo, Observable, watch } from "../valoo";
import { InspectData, UpdateType } from "../../adapter/adapter";
import { ObjPath } from "../components/ElementProps";
import { createSearchStore } from "./search";
import { createModalState } from "../components/Modals";
import { createFilterStore } from "./filter";
import { flattenChildren } from "../components/tree/windowing";

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
	parentId: ID;
	children: ID[];

	// Profiling
	duration: Observable<number>;

	// Display properties
	depth: number;
	selected: Observable<boolean>;
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
	selected: Observable<DevNode | null>;
	selectedRef: Observable<null | HTMLElement>;
	visiblity: {
		collapsed: Observable<Set<ID>>;
		hidden: Observable<Set<ID>>;
	};
	search: ReturnType<typeof createSearchStore>;
	modal: ReturnType<typeof createModalState>;
	filter: ReturnType<typeof createFilterStore>;
	actions: {
		selectNode: (id: ID) => void;
		highlightNode: (id: ID | null) => void;
		collapseNode: (id: ID) => void;
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
	const nodeList = valoo<ID[]>([]);

	nodes.on(v => {
		nodeList.$ = flattenChildren(v, rootToChild.$.get(1)!);
	});

	// Selection
	const selectedNode = valoo<DevNode | null>(null);
	const selectedRef = valoo<HTMLElement | null>(null);

	// Toggle
	const collapsed = valoo<Set<ID>>(new Set());
	const hidden = watch(() => {
		const out = new Set<ID>();
		collapsed.$.forEach(id =>
			flattenChildren(nodes.$, id).forEach(child => out.add(child)),
		);
		return out;
	});

	const inspectData = valoo<InspectData>(EMPTY_INSPECT);

	const isPicking = valoo<boolean>(false);

	return {
		nodeList,
		isPicking,
		inspectData,
		roots,
		rootToChild,
		nodes,
		selected: selectedNode,
		selectedRef,
		visiblity: {
			collapsed,
			hidden,
		},
		search: createSearchStore(nodes),
		modal: createModalState(),
		filter: createFilterStore(notify),
		actions: {
			collapseNode: id => {
				if (!collapsed.$.has(id)) {
					collapsed.$.add(id);
				} else {
					collapsed.$.delete(id);
				}
				collapsed.$ = collapsed.$;
			},
			selectNode: id => {
				if (selectedNode.$ !== null) {
					if (selectedNode.$.id === id) return;

					selectedNode.$.selected.$ = false;
				}
				const node = nodes.$.get(id)!;
				node.selected.$ = true;
				selectedNode.$ = node;
				notify("inspect", id);
			},
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
				selectedNode.$ = null;
				selectedRef.$ = null;
				collapsed.$ = new Set();
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
	let ref = useRef<T>();
	let [value, set] = useState<T>(ref.current || ((ref as any).current = fn()));

	useEffect(() => {
		let v = watch(fn);
		v.on(next => set(next));
		return () => v._disposers.forEach(disp => disp());
	}, []);

	return value;
}
