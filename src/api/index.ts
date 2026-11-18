import type { DevtoolsApi, DevtoolsApiTarget } from "./types";

export type {
	DevtoolsApi,
	DevtoolsApiTarget,
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
		getRenderers() {
			return Array.from(target.renderers, ([id, renderer]) => ({
				id,
				tree: typeof renderer.getTreeSnapshot === "function",
				inspect: typeof renderer.inspectSnapshot === "function",
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
