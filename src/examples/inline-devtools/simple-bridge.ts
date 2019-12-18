import { Bridge, Listener } from "../../adapter/bridge";

/**
 * In-memory variant of the bridge that's normally used to pass messages
 * to the extension. This one here is simplified to be nothing more than
 * an event emitter.
 */
export function createSimpleBridge(): Bridge {
	const listeners = new Map<string, Array<Listener | null>>();
	return {
		_listeners: listeners,
		listen: (name, cb) => {
			if (!listeners.has(name)) {
				listeners.set(name, []);
			}

			const idx = listeners.get(name)!.push(cb) - 1;
			return () => (listeners.get(name)![idx] = null);
		},
		send: (name, data) => {
			if (listeners.has(name)) {
				listeners.get(name)!.forEach(l => l && l(data));
			}
		},
	};
}
