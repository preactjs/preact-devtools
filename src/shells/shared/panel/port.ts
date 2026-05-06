export interface PortEvent<T extends (...args: any[]) => void> {
	addListener(fn: T): void;
}

export interface PanelPort {
	postMessage(message: any): void;
	onMessage: PortEvent<(message: any) => void>;
	onDisconnect: PortEvent<() => void>;
}

export interface PanelPortControllerOptions {
	connect: () => PanelPort;
	onMessage: (message: any) => void | Promise<void>;
	onDisconnect?: () => void;
	createInitMessage: () => any | null;
	debug?: (...args: any[]) => void;
	initialReconnectDelay?: number;
	maxReconnectDelay?: number;
	setTimeout?: typeof setTimeout;
	clearTimeout?: typeof clearTimeout;
}

export function createPanelPortController(options: PanelPortControllerOptions) {
	const setTimer = options.setTimeout || setTimeout;
	const clearTimer = options.clearTimeout || clearTimeout;
	const initialReconnectDelay = options.initialReconnectDelay || 250;
	const maxReconnectDelay = options.maxReconnectDelay || 5000;
	const debug = options.debug || (() => {});

	let port: PanelPort | null = null;
	let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
	let reconnectDelay = initialReconnectDelay;

	const scheduleReconnect = () => {
		if (reconnectTimer !== null) return;

		const delay = reconnectDelay;
		reconnectDelay = Math.min(reconnectDelay * 2, maxReconnectDelay);
		reconnectTimer = setTimer(() => {
			reconnectTimer = null;
			connect();
		}, delay);
	};

	const handleDisconnect = (disconnectedPort: PanelPort) => {
		if (port !== disconnectedPort) return;

		debug("devtools port disconnected");
		port = null;
		options.onDisconnect?.();
		scheduleReconnect();
	};

	const post = (message: any) => {
		if (port === null) {
			debug("<- devtools dropped while disconnected", message);
			return;
		}

		try {
			port.postMessage(message);
		} catch (err) {
			debug("postMessage failed, reconnecting", err);
			handleDisconnect(port);
		}
	};

	const sendInitMessage = () => {
		const message = options.createInitMessage();
		if (message !== null) post(message);
	};

	function connect() {
		if (reconnectTimer !== null) {
			clearTimer(reconnectTimer);
			reconnectTimer = null;
		}

		try {
			const nextPort = options.connect();
			port = nextPort;
			reconnectDelay = initialReconnectDelay;
			nextPort.onMessage.addListener(options.onMessage);
			nextPort.onDisconnect.addListener(() => handleDisconnect(nextPort));
			sendInitMessage();
		} catch (err) {
			debug("connect failed, retrying", err);
			scheduleReconnect();
		}
	}

	return {
		connect,
		post,
		handleDisconnect,
	};
}
