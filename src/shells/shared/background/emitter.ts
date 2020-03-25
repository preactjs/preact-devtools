import { debug } from "../../../debug";

export type Handler<T> = (e: T) => void;
export interface Emitter<T> {
	on(source: string, handler: Handler<T>): void;
	off(source: string): void;
	emit(source: string, event: T): void;
	connected(): string[];
}

/**
 * Emitter which will dispatch to everyone but the
 * calling source.
 */
export function BackgroundEmitter<T = any>() {
	const targets: Record<string, Handler<T> | undefined> = {};

	return {
		on(source: string, handler: Handler<T>) {
			targets[source] = handler;
		},
		off(source: string) {
			targets[source] = undefined;
		},
		emit(source: string, event: T) {
			Object.entries(targets).forEach(([name, f]) => {
				if (name !== source && f) {
					debug(source, "->", name, event);
					f(event);
				}
			});
		},
		connected() {
			return Object.keys(targets);
		},
	};
}
