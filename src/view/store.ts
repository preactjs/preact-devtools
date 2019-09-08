import { createContext } from "preact";
import { useContext, useState, useRef, useEffect } from "preact/hooks";
import { valoo, Observable, track } from "./valoo";
import { InspectData, UpdateType } from "../adapter/adapter";
import { ObjPath } from "./components/ElementProps";

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
	inspectData: Observable<InspectData>;
	roots: Observable<ID[]>;
	rootToChild: Observable<Map<number, number>>;
	nodes: Observable<Tree>;
	selected: Observable<DevNode | null>;
	selectedRef: Observable<null | HTMLElement>;
	visiblity: {
		collapsed: Observable<Set<ID>>;
		hidden: Observable<Set<ID>>;
	};
	actions: {
		selectNode: (id: ID, ref: HTMLElement) => void;
		highlightNode: (id: ID | null) => void;
		collapseNode: (id: ID) => void;
		logNode: (id: ID) => void;
		updateNode: (id: ID, type: UpdateType, path: ObjPath, value: any) => void;
		clear(): void;
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

	// Selection
	const selectedNode = valoo<DevNode | null>(null);
	const selectedRef = valoo<HTMLElement | null>(null);

	// Toggle
	const collapsed = valoo<Set<ID>>(new Set());
	const hidden = track(() => {
		const out = new Set<ID>();
		collapsed().forEach(id =>
			getAllChildren(nodes(), id).forEach(child => out.add(child)),
		);
		return out;
	}, [collapsed, nodes]);

	const inspectData = valoo<InspectData>(EMPTY_INSPECT);

	return {
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
		actions: {
			collapseNode: id => {
				if (!collapsed().has(id)) {
					collapsed().add(id);
				} else {
					collapsed().delete(id);
				}
				collapsed(collapsed());
			},
			selectNode: (id, ref) => {
				if (selectedNode() !== null) {
					if (selectedNode()!.id === id) return;

					selectedNode()!.selected(false);
				}
				const node = nodes().get(id)!;
				node.selected(true);

				selectedRef(ref);
				selectedNode(node);
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
			clear() {
				inspectData(EMPTY_INSPECT);
				nodes(new Map());
				roots([]);
				rootToChild(new Map());
				selectedNode(null);
				selectedRef(null);
				collapsed(new Set());
				listeners = [];
			},
		},
		subscribe(fn) {
			const idx = listeners.push(fn);
			return () => (listeners[idx] = null);
		},
	};
}

export function getAllChildren(tree: Tree, id: ID): ID[] {
	const out: ID[] = [];
	const visited = new Set<ID>();
	let item: ID | undefined;
	let stack: ID[] = [id];
	while ((item = stack.pop())) {
		const node = tree.get(item);
		if (node) {
			if (!visited.has(node.id)) {
				out.push(node.id);
				visited.add(node.id);
			}
			node.children.reverse().forEach(x => stack.push(x));
		}
	}
	return out;
}

export const AppCtx = createContext<Store>(null as any);

export const useStore = () => useContext(AppCtx);

export function useObserver<T>(fn: () => T, deps: Observable[]): T {
	let [i, setI] = useState(0);

	useEffect(() => {
		const subs = deps.map(x => x.on(() => setI(++i)));
		return () => subs.forEach(x => x());
	}, []);

	return fn();
}
