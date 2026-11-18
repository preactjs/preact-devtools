import { createEventSource } from "./events";
import type { DevtoolsEvent, DevtoolsEventMap } from "./types";
import { expectTypeOf } from "vitest";

// Each flush is one microtask. Reentrant emissions run in the following one.
const tick = () => new Promise<void>(resolve => queueMicrotask(resolve));

describe("DevTools event delivery", () => {
	it("infers named events and a discriminated wildcard union", () => {
		const source = createEventSource();
		source.onDevtoolsEvent("commit", event => {
			expectTypeOf(event).toEqualTypeOf<DevtoolsEventMap["commit"]>();
		});
		source.onDevtoolsEvent("*", event => {
			expectTypeOf(event).toEqualTypeOf<DevtoolsEvent>();
			if (event.type === "commit")
				expectTypeOf(event.revision).toEqualTypeOf<number>();
		});
		// @ts-expect-error Unknown public event name
		expect(() => source.onDevtoolsEvent("unknown", () => {})).toThrow(
			TypeError,
		);
	});

	it("has no timestamp or scheduling overhead without interested listeners", () => {
		const source = createEventSource();
		const now = vi.spyOn(performance, "now");
		const schedule = vi.spyOn(globalThis, "queueMicrotask");
		const off = source.onDevtoolsEvent("commit", () => {}, { rendererId: 2 });
		const offAttach = source.onDevtoolsEvent("renderer-attached", () => {});
		for (let i = 0; i < 1000; i++) source.emitCommit(1, i);
		off();
		off();
		offAttach();
		source.emitCommit(2, 1000);
		source.emitAttached(1);
		source.emitDetached(1);
		expect(now).not.toHaveBeenCalled();
		expect(schedule).not.toHaveBeenCalled();
		now.mockRestore();
		schedule.mockRestore();
	});

	it("batches scheduling and independently removes duplicate filtered subscriptions", async () => {
		const source = createEventSource();
		const listener = vi.fn();
		const offA = source.onDevtoolsEvent("commit", listener, { rendererId: 1 });
		const offB = source.onDevtoolsEvent("commit", listener, { rendererId: 1 });
		offA();
		const schedule = vi.spyOn(globalThis, "queueMicrotask");
		for (let i = 0; i < 100; i++) source.emitCommit(1, i);
		expect(schedule).toHaveBeenCalledTimes(1);
		schedule.mockRestore();
		await tick();
		expect(listener).toHaveBeenCalledTimes(100);
		offB();
		source.emitCommit(1, 101);
		await tick();
		expect(listener).toHaveBeenCalledTimes(100);
	});

	it("delivers frozen metadata asynchronously to named and wildcard listeners in emission order", async () => {
		const source = createEventSource();
		const all: DevtoolsEvent[] = [];
		const named = vi.fn();
		source.onDevtoolsEvent("*", e => all.push(e));
		source.onDevtoolsEvent("commit", named);
		source.emitAttached(1);
		source.emitCommit(1, 4);
		source.emitDetached(1);
		expect(all).toEqual([]);
		await tick();
		expect(all.map(e => [e.type, e.sequence])).toEqual([
			["renderer-attached", 1],
			["commit", 2],
			["renderer-detached", 3],
		]);
		expect(all.every(Object.isFrozen)).toBe(true);
		expect(all.every(e => Number.isFinite(e.timestamp))).toBe(true);
		expect(named).toHaveBeenCalledExactlyOnceWith(all[1]);
	});

	it("filters renderers for named and wildcard listeners", async () => {
		const source = createEventSource();
		const named = vi.fn();
		const all = vi.fn();
		source.onDevtoolsEvent("commit", named, { rendererId: 2 });
		source.onDevtoolsEvent("*", all, { rendererId: 1 });
		source.emitCommit(1, 1);
		source.emitCommit(2, 1);
		source.emitAttached(1);
		source.emitAttached(2);
		await tick();
		expect(named).toHaveBeenCalledTimes(1);
		expect(named.mock.calls[0][0].rendererId).toBe(2);
		expect(all.mock.calls.map(([e]) => [e.type, e.rendererId])).toEqual([
			["commit", 1],
			["renderer-attached", 1],
		]);
	});

	it("does not replay queued events to new subscriptions", async () => {
		const source = createEventSource();
		source.onDevtoolsEvent("*", () => {});
		source.emitCommit(1, 1);
		const listener = vi.fn();
		source.onDevtoolsEvent("commit", listener);
		source.emitCommit(1, 2);
		await tick();
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener.mock.calls[0][0].revision).toBe(2);
	});

	it("honors unsubscribe before delivery and during a batch", async () => {
		const source = createEventSource();
		const removed = vi.fn();
		const offRemoved = source.onDevtoolsEvent("commit", removed);
		const once = vi.fn(() => off());
		const off = source.onDevtoolsEvent("commit", once);
		source.emitCommit(1, 1);
		source.emitCommit(1, 2);
		offRemoved();
		await tick();
		expect(removed).not.toHaveBeenCalled();
		expect(once).toHaveBeenCalledTimes(1);
	});

	it("isolates listener errors and leaves later events usable", async () => {
		const source = createEventSource();
		const error = new Error("subscriber");
		const report = vi.spyOn(console, "error").mockImplementation(() => {});
		source.onDevtoolsEvent("commit", () => {
			throw error;
		});
		const good = vi.fn();
		source.onDevtoolsEvent("*", good);
		source.emitCommit(1, 1);
		await tick();
		source.emitCommit(1, 2);
		await tick();
		expect(good).toHaveBeenCalledTimes(2);
		expect(report).toHaveBeenCalledWith(expect.any(String), error);
		report.mockRestore();
	});

	it("defers reentrant emissions to a later microtask", async () => {
		const source = createEventSource();
		const revisions: number[] = [];
		source.onDevtoolsEvent("commit", e => {
			revisions.push(e.revision);
			if (e.revision === 1) {
				source.emitCommit(1, 2);
				expect(revisions).toEqual([1]);
			}
		});
		source.emitCommit(1, 1);
		await tick();
		await tick();
		expect(revisions).toEqual([1, 2]);
	});

	it("bounds bursts to the latest 256 events and reports hook-wide gaps", async () => {
		const source = createEventSource();
		const events: DevtoolsEvent[] = [];
		const gaps = vi.fn();
		source.onDevtoolsEvent("*", e => events.push(e), { rendererId: 1 });
		source.onDevtoolsEvent("events-dropped", gaps, { rendererId: 99 });
		for (let i = 1; i <= 1000; i++) source.emitCommit(1, i);
		await tick();
		expect(events).toHaveLength(257);
		expect(events[0]).toMatchObject({
			type: "events-dropped",
			rendererId: null,
			fromSequence: 1,
			toSequence: 744,
		});
		expect(events[1]).toMatchObject({ type: "commit", revision: 745 });
		expect(events[events.length - 1]).toMatchObject({
			type: "commit",
			revision: 1000,
		});
		expect(gaps).toHaveBeenCalledTimes(1);
		// The next batch starts clean, without replaying the gap.
		source.emitCommit(1, 1001);
		await tick();
		expect(events[events.length - 1]).toMatchObject({
			type: "commit",
			revision: 1001,
		});
		expect(gaps).toHaveBeenCalledTimes(1);
	});

	it("discards pending work on last unsubscribe without affecting a later subscriber", async () => {
		const source = createEventSource();
		const off = source.onDevtoolsEvent("commit", () => {});
		source.emitCommit(1, 1);
		off();
		const next = vi.fn();
		source.onDevtoolsEvent("commit", next);
		source.emitCommit(1, 2);
		await tick();
		expect(next).toHaveBeenCalledExactlyOnceWith(
			expect.objectContaining({ revision: 2 }),
		);
	});
});
