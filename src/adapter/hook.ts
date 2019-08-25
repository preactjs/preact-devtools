import { Adapter } from "./adapter";

export type EventTypes = "operation" | "attach";
export type EmitterFn = (event: EventTypes, data: number[]) => void;

export interface DevtoolsHook {
	isDisabled: boolean;
	connected: boolean;
	renderers: Map<number, Adapter>;
	attach(fn: (emit: EmitterFn) => Adapter): number;
	detach(id: number): void;
}

/**
 * Create hook to which Preact will subscribe and listen to. The hook
 * is the entrypoint where everything begins.
 */
export function createHook(emit: EmitterFn): DevtoolsHook {
	const renderers = new Map();
	let uid = 0;

	return {
		isDisabled: false,
		connected: false,
		renderers,
		attach: fn => {
			renderers.set(++uid, fn(emit));
			emit("attach", [uid]);
			return uid;
		},
		detach: id => renderers.delete(id),
	};
}
