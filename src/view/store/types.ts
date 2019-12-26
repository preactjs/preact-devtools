import { Observable } from "../valoo";
import { InspectData } from "../../adapter/adapter/adapter";
import { createSearchStore } from "./search";
import { createModalState } from "../components/Modals";
import { createFilterStore } from "./filter";
import { createSelectionStore } from "./selection";
import { Collapser } from "./collapser";
import { EmitFn } from "../../adapter/hook";
import { createProfilerStore } from "../components/profiler/data/ProfilerStore";
import { CommitData, ProfilerState } from "./commits";

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

	// Profiler
	startTime: number;
	endTime: number;
}

export type Theme = "auto" | "light" | "dark";

export interface Store {
	profiler2: ProfilerState;
	isPicking: Observable<boolean>;
	inspectData: Observable<InspectData | null>;
	roots: Observable<ID[]>;
	nodes: Observable<Map<ID, DevNode>>;
	nodeList: Observable<ID[]>;
	theme: Observable<Theme>;
	search: ReturnType<typeof createSearchStore>;
	modal: ReturnType<typeof createModalState>;
	filter: ReturnType<typeof createFilterStore>;
	selection: ReturnType<typeof createSelectionStore>;
	collapser: Collapser<ID>;
	profiler: ReturnType<typeof createProfilerStore>;
	actions: {
		inspect: (id: ID) => void;
		highlightNode: (id: ID | null) => void;
		clear(): void;
		startPickElement(): void;
		stopPickElement(): void;
	};
	emit: EmitFn;
	subscribe(fn: Listener): () => void;
}

export type Listener = (name: string, data: any) => void;
