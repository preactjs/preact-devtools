import { expect, vi } from "vitest";
import { createPanelPortController, PanelPort } from "./port";

class FakeEvent<T extends (...args: any[]) => void> {
	listeners: T[] = [];

	addListener(fn: T) {
		this.listeners.push(fn);
	}

	emit(...args: Parameters<T>) {
		for (let i = 0; i < this.listeners.length; i++) {
			this.listeners[i](...args);
		}
	}
}

class FakePort implements PanelPort {
	messages: any[] = [];
	onMessage = new FakeEvent<(message: any) => void>();
	onDisconnect = new FakeEvent<() => void>();
	postMessage = vi.fn((message: any) => {
		this.messages.push(message);
	});
}

describe("createPanelPortController", () => {
	it("connects, listens for messages, and sends init", () => {
		const port = new FakePort();
		const onMessage = vi.fn();

		const controller = createPanelPortController({
			connect: () => port,
			onMessage,
			createInitMessage: () => ({ type: "init", tabId: 1 }),
		});

		controller.connect();
		port.onMessage.emit({ type: "ready" });

		expect(port.messages).to.deep.equal([{ type: "init", tabId: 1 }]);
		expect(onMessage).toHaveBeenCalledWith({ type: "ready" });
	});

	it("clears disconnected state, reconnects with backoff, and resends init", () => {
		vi.useFakeTimers();
		try {
			const ports = [new FakePort(), new FakePort()];
			const onDisconnect = vi.fn();
			const connect = vi.fn(() => ports.shift()!);

			const controller = createPanelPortController({
				connect,
				onMessage: vi.fn(),
				onDisconnect,
				createInitMessage: () => ({ type: "init", tabId: 1 }),
			});

			controller.connect();
			const firstPort = connect.mock.results[0].value;
			firstPort.onDisconnect.emit();

			expect(onDisconnect).toHaveBeenCalledTimes(1);
			expect(connect).toHaveBeenCalledTimes(1);

			vi.advanceTimersByTime(249);
			expect(connect).toHaveBeenCalledTimes(1);

			vi.advanceTimersByTime(1);
			expect(connect).toHaveBeenCalledTimes(2);
			expect(connect.mock.results[1].value.messages).to.deep.equal([
				{ type: "init", tabId: 1 },
			]);
		} finally {
			vi.useRealTimers();
		}
	});

	it("reconnects when posting to a disconnected port throws", () => {
		vi.useFakeTimers();
		try {
			const firstPort = new FakePort();
			const secondPort = new FakePort();
			firstPort.postMessage.mockImplementation(() => {
				throw new Error("disconnected");
			});
			const onDisconnect = vi.fn();
			const connect = vi
				.fn()
				.mockReturnValueOnce(firstPort)
				.mockReturnValueOnce(secondPort);

			const controller = createPanelPortController({
				connect,
				onMessage: vi.fn(),
				onDisconnect,
				createInitMessage: () => ({ type: "init", tabId: 1 }),
				debug: vi.fn(),
			});

			controller.connect();
			controller.post({ type: "select-node", data: 2 });

			expect(onDisconnect).toHaveBeenCalledTimes(1);
			expect(connect).toHaveBeenCalledTimes(1);

			vi.advanceTimersByTime(250);
			expect(connect).toHaveBeenCalledTimes(2);
			expect(secondPort.messages).to.deep.equal([{ type: "init", tabId: 1 }]);
		} finally {
			vi.useRealTimers();
		}
	});

	it("ignores stale disconnects from a replaced port", () => {
		const firstPort = new FakePort();
		const secondPort = new FakePort();
		const onDisconnect = vi.fn();
		const connect = vi
			.fn()
			.mockReturnValueOnce(firstPort)
			.mockReturnValueOnce(secondPort);

		const controller = createPanelPortController({
			connect,
			onMessage: vi.fn(),
			onDisconnect,
			createInitMessage: () => null,
		});

		controller.connect();
		controller.connect();
		firstPort.onDisconnect.emit();

		expect(onDisconnect).not.toHaveBeenCalled();
		controller.post({ type: "ping" });
		expect(secondPort.messages).to.deep.equal([{ type: "ping" }]);
	});
});
