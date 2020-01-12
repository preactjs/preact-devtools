import { createSimpleBridge } from "../examples/inline-devtools/simple-bridge";

export type Listener<T = any> = (data: T) => void;
export type Unsubscribe = () => void;

export interface Bridge {
	_listeners: Map<string, Array<Listener | null>>;
	listen: (name: string, cb: Listener) => Unsubscribe;
	send(name: string, data: any): void;
}

/**
 * The bridge basically just abstracts over the messaging protocol
 */
export function createBridge(target: Window): Bridge {
	const simple = createSimpleBridge();

	target.addEventListener("message", ev => {
		if (ev.data.source === "preact-devtools-content-script" && ev.data) {
			const { name } = ev.data;
			simple.send(name, ev.data.payload);
		}
	});

	return {
		_listeners: simple._listeners,
		listen: simple.listen,
		send(name: string, data: any) {
			if (name === "detect" || name === "attach") {
				target.postMessage(
					{
						source: "preact-devtools-detector",
						payload: data,
					},
					"*",
				);
				if (name === "attach") {
					target.postMessage(
						{
							source: "preact-devtools",
							payload: { name, payload: data },
						},
						"*",
					);
				}
			} else {
				target.postMessage(
					{
						source: "preact-devtools",
						payload: { name, payload: data },
					},
					"*",
				);
			}

			simple.send(name, data);
		},
	};
}
