import { Observable } from "../valoo";
import { InspectData } from "../../adapter/adapter/adapter";
import { createSearchStore } from "./search";
import { createFilterStore } from "./filter";
import { createSelectionStore } from "./selection";
import { Collapser } from "./collapser";
import { EmitFn } from "../../adapter/hook";
import { ProfilerState } from "../components/profiler/data/commits";

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

	// Display (Elements + Profiler)
	depth: number;

	// Raw absolute timing data.
	startTime: number;
	endTime: number;
	// Normalized timing data to keep the timings
	// of the whole tree consistent across future
	// commits. These timings are relative to the
	// very first node.
	treeStartTime: number;
	treeEndTime: number;
}

export type Theme = "auto" | "light" | "dark";

export type Tree = Map<ID, DevNode>;

export interface Store {
	notify: EmitFn;
	profiler: ProfilerState;
	isPicking: Observable<boolean>;
	inspectData: Observable<InspectData | null>;
	roots: Observable<ID[]>;
	nodes: Observable<Tree>;
	nodeList: Observable<ID[]>;
	theme: Observable<Theme>;
	treeDepth: Observable<number>;
	search: ReturnType<typeof createSearchStore>;
	filter: ReturnType<typeof createFilterStore>;
	selection: ReturnType<typeof createSelectionStore>;
	collapser: Collapser<ID>;
	actions: {
		inspect: (id: ID) => void;
		highlightNode: (id: ID | null) => void;
		clear(): void;
	};
	emit: EmitFn;
	subscribe(fn: Listener): () => void;
}

export type Listener = (name: string, data: any) => void;
