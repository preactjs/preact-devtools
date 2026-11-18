import type { DevtoolsApi, DevtoolsApiTarget } from "./types";
export { unstable_createSignalBindingTree } from "./signal-bindings";
export type {
	SignalDomBinding,
	SignalDomBindingSource,
	SignalBindingNode,
} from "./signal-bindings";

export type {
	DevtoolsApi,
	DevtoolsApiTarget,
	DevtoolsEvent,
	DevtoolsEventMap,
	DevtoolsEventSource,
	EventOptions,
	OnDevtoolsEvent,
	InspectOptions,
	InspectionSnapshot,
	RendererCapabilities,
	SnapshotNode,
	SnapshotValue,
	TreeOptions,
	TreeSnapshot,
} from "./types";

/**
 * Connect to an existing page hook without installing one or mounting a UI.
 * This factory has no window/global side effects. Only expose it in development
 * or in an explicitly opted-in environment: inspection can reveal app data.
 */
export function createDevtoolsApi(target: DevtoolsApiTarget): DevtoolsApi {
	return {
		apiVersion: 1,
		supportsEvents: typeof target.onDevtoolsEvent === "function",
		on(type, handler, options) {
			if (!target.onDevtoolsEvent) {
				throw new Error("This hook does not support DevTools events");
			}
			return target.onDevtoolsEvent(type, handler, options);
		},
		getRenderers() {
			return Array.from(target.renderers, ([id, renderer]) => ({
				id,
				tree: typeof renderer.getTreeSnapshot === "function",
				inspect: typeof renderer.inspectSnapshot === "function",
				commits:
					typeof target.onDevtoolsEvent === "function" &&
					typeof renderer.subscribeToCommits === "function",
			}));
		},
		getTree(rendererId, options) {
			return (
				target.renderers.get(rendererId)?.getTreeSnapshot?.(options) ?? null
			);
		},
		inspect(rendererId, nodeId, options) {
			return (
				target.renderers.get(rendererId)?.inspectSnapshot?.(nodeId, options) ??
				null
			);
		},
	};
}
