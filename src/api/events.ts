import type { DevtoolsEvent, DevtoolsEventMap, OnDevtoolsEvent } from "./types";

const QUEUE_SIZE = 256;

type Listener = {
	callback: (event: DevtoolsEvent) => void;
	rendererId?: number;
	after: number;
};
function channel() {
	return {
		listeners: new Set<Listener>(),
		all: 0,
		renderers: new Map<number, number>(),
	};
}
type Channel = ReturnType<typeof channel>;
function interested(channel: Channel, rendererId: number) {
	return channel.all > 0 || channel.renderers.has(rendererId);
}

/** Bounded, metadata-only delivery. Never retains VNodes or application values. */
export function createEventSource() {
	const commits = channel();
	const attached = channel();
	const detached = channel();
	const gaps = channel();
	const wildcard = channel();
	const channels = new Map<keyof DevtoolsEventMap | "*", Channel>([
		["commit", commits],
		["renderer-attached", attached],
		["renderer-detached", detached],
		["events-dropped", gaps],
		["*", wildcard],
	]);
	let sequence = 0;
	let queue: DevtoolsEvent[] = [];
	let destinations: Channel[] = [];
	let head = 0;
	let size = 0;
	let scheduled = false;
	let droppedFrom = 0;
	let droppedTo = 0;

	function deliver(channel: Channel, event: DevtoolsEvent) {
		channel.listeners.forEach(listener => {
			if (
				event.sequence <= listener.after ||
				(event.type !== "events-dropped" &&
					listener.rendererId !== undefined &&
					listener.rendererId !== event.rendererId)
			)
				return;
			try {
				listener.callback(event);
			} catch (error) {
				// eslint-disable-next-line no-console
				console.error("[PREACT DEVTOOLS] Event listener failed", error);
			}
		});
	}

	function flush() {
		scheduled = false;
		const batch = queue;
		const targets = destinations;
		const start = head;
		const length = size;
		const from = droppedFrom;
		const to = droppedTo;
		queue = [];
		destinations = [];
		head = size = 0;
		droppedFrom = droppedTo = 0;
		if (from) {
			const gap = Object.freeze({
				type: "events-dropped",
				rendererId: null,
				sequence: to,
				timestamp: performance.now(),
				fromSequence: from,
				toSequence: to,
			}) satisfies DevtoolsEvent;
			deliver(gaps, gap);
			deliver(wildcard, gap);
		}
		for (let i = 0; i < length; i++) {
			const index = (start + i) % QUEUE_SIZE;
			const event = batch[index];
			deliver(targets[index], event);
			deliver(wildcard, event);
		}
	}

	function enqueue(destination: Channel, event: DevtoolsEvent) {
		const index = (head + size) % QUEUE_SIZE;
		if (size === QUEUE_SIZE) {
			const dropped = queue[head];
			if (!droppedFrom) droppedFrom = dropped.sequence;
			droppedTo = dropped.sequence;
			head = (head + 1) % QUEUE_SIZE;
		} else {
			size++;
		}
		queue[index] = Object.freeze(event);
		// Keep dispatch targets outside public records: no string lookup or
		// additional envelope allocation for each delivered event.
		destinations[index] = destination;
		if (!scheduled) {
			scheduled = true;
			queueMicrotask(flush);
		}
	}

	const onDevtoolsEvent: OnDevtoolsEvent = (type, callback, options) => {
		const channel = channels.get(type);
		if (!channel) throw new TypeError(`Unknown DevTools event: ${type}`);
		if (typeof callback !== "function")
			throw new TypeError("Expected an event handler");
		const rendererId = options?.rendererId;
		const listener: Listener = {
			// The channel selection above preserves the event/handler relationship.
			callback: callback as (event: DevtoolsEvent) => void,
			rendererId,
			after: sequence,
		};
		channel.listeners.add(listener);
		if (rendererId === undefined) channel.all++;
		else
			channel.renderers.set(
				rendererId,
				(channel.renderers.get(rendererId) ?? 0) + 1,
			);
		return () => {
			if (!channel.listeners.delete(listener)) return;
			if (rendererId === undefined) channel.all--;
			else {
				const count = channel.renderers.get(rendererId)! - 1;
				if (count) channel.renderers.set(rendererId, count);
				else channel.renderers.delete(rendererId);
			}
			if (Array.from(channels.values()).every(c => c.listeners.size === 0)) {
				queue = [];
				destinations = [];
				head = size = 0;
				droppedFrom = droppedTo = 0;
			}
		};
	};

	return {
		onDevtoolsEvent,
		emitCommit(rendererId: number, revision: number) {
			if (!interested(commits, rendererId) && !interested(wildcard, rendererId))
				return;
			enqueue(commits, {
				type: "commit",
				rendererId,
				revision,
				sequence: ++sequence,
				timestamp: performance.now(),
			});
		},
		emitAttached(rendererId: number) {
			if (
				!interested(attached, rendererId) &&
				!interested(wildcard, rendererId)
			)
				return;
			enqueue(attached, {
				type: "renderer-attached",
				rendererId,
				sequence: ++sequence,
				timestamp: performance.now(),
			});
		},
		emitDetached(rendererId: number) {
			if (
				!interested(detached, rendererId) &&
				!interested(wildcard, rendererId)
			)
				return;
			enqueue(detached, {
				type: "renderer-detached",
				rendererId,
				sequence: ++sequence,
				timestamp: performance.now(),
			});
		},
	};
}
