import { DevtoolsHook } from "./hook";
import { Options } from "preact";
import { createAdapter, setupOptions } from "./adapter";
import { createBridge } from "./bridge";
import { createRenderer } from "./10/renderer";

export async function init(options: Options, getHook: () => DevtoolsHook) {
	const bridge = createBridge(window);
	const hook = getHook();
	const renderer = createRenderer(hook);
	const adapter = createAdapter(hook, renderer);

	// Add options as early as possible, so that we don't miss the first commit
	setupOptions(options as any, renderer);

	// Devtools can take a while to set up
	await waitForHook(getHook);

	// We're set up and now we can start processing events
	// const hook = getHook();

	bridge.listen("initialized", renderer.flushInitial);
	bridge.listen("highlight", adapter.highlight);
	bridge.listen("update-node", ev => {
		adapter.update(ev.id, ev.type, ev.path, ev.value);
	});
	bridge.listen("select", adapter.select);
	bridge.listen("inspect", adapter.inspect);
	bridge.listen("log", adapter.log);
	bridge.listen("update", adapter.log);

	return hook.attach(renderer);
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
