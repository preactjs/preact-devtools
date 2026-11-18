/** IDs are scoped to a renderer and are valid only for the current page load. */
export interface SnapshotNode {
	/** Index of the parent in this snapshot, or null for a root. */
	parent: number | null;
	/** Null when the renderer has not assigned this node an inspectable ID. */
	id: number | null;
	name: string;
	key: string | null;
	kind: "root" | "component" | "element" | "text";
}

export interface TreeOptions {
	/** Defaults to 1000; maximum 10000. */
	maxNodes?: number;
	/** Root depth is zero. Defaults to 20; maximum 100. */
	maxDepth?: number;
	/** UTF-8 JSON response budget. Defaults to 65536; maximum 1048576. */
	maxBytes?: number;
}

export interface TreeSnapshot {
	/** Preorder traversal, including nodes hidden by the UI's filters. */
	nodes: SnapshotNode[];
	truncated: boolean;
	/** Commit revision at read time, when supplied by the renderer. */
	revision?: number;
}

export interface InspectOptions {
	/** Defaults to 3; maximum 20. */
	maxDepth?: number;
	/** Total properties/array items across the response. Defaults to 100; maximum 10000. */
	maxEntries?: number;
	/** Defaults to 1000; maximum 10000. */
	maxStringLength?: number;
	/** UTF-8 JSON response budget. Defaults to 65536; maximum 1048576. */
	maxBytes?: number;
}

export type SnapshotValue =
	| null
	| boolean
	| number
	| string
	| SnapshotValue[]
	| { [key: string]: SnapshotValue };

export interface InspectionSnapshot {
	value: SnapshotValue;
	truncated: boolean;
}

/** Optional bridge implemented by current renderers; older renderers may omit it. */
export interface SnapshotRenderer {
	getTreeSnapshot?(options?: TreeOptions): TreeSnapshot;
	/** Internal hook bridge; callbacks run synchronously and must not call user code. */
	subscribeToCommits?(callback: (revision: number) => void): () => void;
	inspectSnapshot?(
		id: number,
		options?: InspectOptions,
	): InspectionSnapshot | null;
}

interface EventMetadata {
	/** Monotonic within this hook, not across frames or page loads. */
	readonly sequence: number;
	/** performance.now() at emission (at delivery for gap notifications). */
	readonly timestamp: number;
}

export interface DevtoolsEventMap {
	commit: EventMetadata & {
		readonly type: "commit";
		readonly rendererId: number;
		readonly revision: number;
	};
	"renderer-attached": EventMetadata & {
		readonly type: "renderer-attached";
		readonly rendererId: number;
	};
	"renderer-detached": EventMetadata & {
		readonly type: "renderer-detached";
		readonly rendererId: number;
	};
	"events-dropped": EventMetadata & {
		readonly type: "events-dropped";
		/** Gaps apply to the hook-wide queue, regardless of renderer filters. */
		readonly rendererId: null;
		readonly fromSequence: number;
		readonly toSequence: number;
	};
}

export type DevtoolsEvent = DevtoolsEventMap[keyof DevtoolsEventMap];
export interface EventOptions {
	rendererId?: number;
}
export type OnDevtoolsEvent = <K extends keyof DevtoolsEventMap | "*">(
	type: K,
	handler: (
		event: K extends keyof DevtoolsEventMap
			? DevtoolsEventMap[K]
			: DevtoolsEvent,
	) => void,
	options?: EventOptions,
) => () => void;

export interface DevtoolsEventSource {
	onDevtoolsEvent?: OnDevtoolsEvent;
}

export interface DevtoolsApiTarget extends DevtoolsEventSource {
	renderers: ReadonlyMap<number, SnapshotRenderer>;
}

export interface RendererCapabilities {
	id: number;
	tree: boolean;
	inspect: boolean;
	/** Whether the hook can publish this renderer's commits. */
	commits: boolean;
}

export interface DevtoolsApi {
	readonly apiVersion: 1;
	readonly supportsEvents: boolean;
	/** Future events only. Throws when the hook has no event support. */
	on: OnDevtoolsEvent;
	getRenderers(): RendererCapabilities[];
	getTree(rendererId: number, options?: TreeOptions): TreeSnapshot | null;
	/** Does not inspect hooks, call getters, or rerender components. */
	inspect(
		rendererId: number,
		nodeId: number,
		options?: InspectOptions,
	): InspectionSnapshot | null;
}
