import { DevtoolEvents } from "../hook";
import { DevtoolsToClient, ClientToDevtools } from "../../constants";

export interface BaseEvent<K extends string, T> {
	type: K;
	data: T;
}

export function listenToDevtools<
	K extends keyof DevtoolEvents,
	T extends DevtoolEvents[K]
>(ctx: Window, type: K, callback: (message: T) => void) {
	ctx.addEventListener(DevtoolsToClient, e => {
		const detail = (e as CustomEvent<BaseEvent<K, T>>).detail;
		if (detail.type === type) callback(detail.data);
	});
}

export function sendToDevtools<K extends keyof DevtoolEvents>(
	ctx: Window,
	type: K,
	data: DevtoolEvents[K],
) {
	ctx.dispatchEvent(
		new CustomEvent(ClientToDevtools, { detail: { type, data } }),
	);
}

/**
 * A port listens to messages from the devtools and can
 * send messages from the client to the devtools
 */
export interface Port {
	send: <K extends keyof DevtoolEvents, T extends DevtoolEvents[K]>(
		type: K,
		message: T,
	) => void;
	listen: <K extends keyof DevtoolEvents, T extends DevtoolEvents[K]>(
		type: K,
		callback: (data: T) => void,
	) => void;
}

export function createPort(ctx: Window): Port {
	return {
		send: (type, message) => sendToDevtools(ctx, type, message),
		listen: (type, callback) => listenToDevtools(ctx, type, callback),
	};
}
