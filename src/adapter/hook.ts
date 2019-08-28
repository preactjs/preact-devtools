import { Renderer } from "./renderer";

export type EmitterFn = (event: string, data: any) => void;

export interface DevtoolsHook {
	renderers: Map<number, Renderer>;
	attach(renderer: Renderer): number;
	detach(id: number): void;
}

/**
 * Create hook to which Preact will subscribe and listen to. The hook
 * is the entrypoint where everything begins.
 */
export function createHook(): DevtoolsHook {
	const renderers = new Map();
	let uid = 0;

	return {
		renderers,
		attach: renderer => {
			renderers.set(++uid, renderer);
			// Content Script is likely not ready at this point, so don't flush here
			window.postMessage(
				{
					source: "preact-devtools-detector",
					payload: [uid],
				},
				"*",
			);
			return uid;
		},
		detach: id => renderers.delete(id),
	};
}
