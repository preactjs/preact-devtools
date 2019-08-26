import { DevtoolsHook, EmitterFn, EventTypes } from "./hook";
import { Options } from "preact";
import { createAdapter, setupOptions } from "./adapter";
import { createIdMapper } from "./IdMapper";

export async function init(options: Options, getHook: () => DevtoolsHook) {
	let hookEmitter: EmitterFn | null = null;
	let buffer: Array<{ data: number[]; name: EventTypes }> = [];
	const emit: EmitterFn = (ev, data) => {
		if (hookEmitter !== null) {
			hookEmitter(ev, data);
		} else {
			buffer.push({ data, name: ev });
		}
	};

	const adapter = createAdapter(emit, createIdMapper());
	setupOptions(options as any, adapter);

	// Devtools can take a while to set up
	await waitForHook(getHook);

	// We're set up and now we can start processing events
	const hook = getHook();
	const rendererId = hook.attach(emit => {
		hookEmitter = emit;
		return adapter;
	});

	// Flush pending events
	if (buffer.length > 0) {
		buffer.forEach(x => hookEmitter!(x.name, x.data));
	}

	return rendererId;
}

export function waitForHook(getHook: () => DevtoolsHook) {
	return new Promise(resolve => {
		let interval = 0;
		const hook = getHook();
		// Devtools might take a bit to load
		if (!hook) {
			setInterval(() => {
				if (getHook()) {
					clearInterval(interval);
					resolve();
				}
			}, 1000);
		} else {
			resolve();
		}
	});
}
