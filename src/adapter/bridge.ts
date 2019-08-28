export type Listener<T = any> = (data: T) => void;

/**
 * The bridge basically just abstracts over the messaging protocol
 */
export function createBridge(target: Window) {
	const listeners = new Map<string, Listener<any>[]>();

	target.addEventListener("message", ev => {
		if (ev.data.source === "preact-devtools-content-script" && ev.data) {
			const { name } = ev.data;
			if (listeners.has(name)) {
				listeners.get(name)!.forEach(cb => cb(ev.data.payload));
			}
		}
	});

	return {
		listen(name: string, cb: Listener) {
			if (!listeners.has(name)) {
				listeners.set(name, []);
			}
			const idx = listeners.get(name)!.push(cb);
			return () => listeners.get(name)!.splice(idx, 1);
		},
		send(name: string, data: any) {
			if (name === "detect" || name === "attach") {
				target.postMessage(
					{
						source: "preact-devtools-detector",
					},
					"*",
				);
			} else {
				target.postMessage(
					{
						source: "preact-devtools",
						payload: { name, payload: data },
					},
					"*",
				);
			}
		},
	};
}
