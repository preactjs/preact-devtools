import { createContext } from "preact";
import { useContext, useState, useRef, useEffect } from "preact/hooks";
import { valoo, Observable, track } from "./valoo";

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

	// Display properties
	depth: number;
	selected: Observable<boolean>;
}

export type Tree = Map<ID, DevNode>;

export interface Store {
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
		collapseNode: (id: ID) => void;
	};
}

export function createStore(): Store {
	const nodes = valoo<Tree>(new Map());
	const roots = valoo<ID[]>([]);
	const rootToChild = valoo<any>(new Map());

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

	return {
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
			},
		},
	};
}

export function getAllChildren(tree: Tree, id: ID): ID[] {
	const out: ID[] = [];
	let item: ID | undefined;
	let stack: ID[] = [id];
	while ((item = stack.shift())) {
		const node = tree.get(item);
		if (node) {
			out.push(node.id);
			stack.push(...node.children);
		}
	}
	console.log("children", out, tree.get(id));
	return out;
}

export function getSelecionLast(tree: Tree, id: ID) {
	const node = tree.get(id);
	console.log({ node, id });
	if (node) {
		const parent = tree.get(node.parentId);
		console.log({ parent });
		if (parent) {
			const idx = parent.children.indexOf(id);
			console.log({ idx });
			if (idx > 0) {
				if (idx + 1 < parent.children.length) {
					return parent.children[idx + 1];
				} else {
					// TODO
					return null;
				}
			}
		}
	}

	return null;
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
