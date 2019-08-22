import { Adapter } from "./adapter";

export type EmitterFn = (event: string, data: number[]) => void;

export interface DevtoolsHook {
	isDisabled: boolean;
	connected: boolean;
	attach(fn: (emit: EmitterFn) => Adapter): number;
	detach(id: number): void;
}

/**
 * Create hook to which Preact will subscribe and listen to. The hook
 * is the entrypoint where everything begins.
 */
export function createHook(emit: EmitterFn): DevtoolsHook {
	const renderers = new Map<number, Adapter>();
	let uid = 0;

	return {
		isDisabled: false,
		connected: false,
		attach: fn => {
			renderers.set(++uid, fn(emit));
			return uid;
		},
		detach: id => renderers.delete(id),
	};
}
