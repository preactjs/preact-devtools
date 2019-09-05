import { DevtoolsHook } from "./hook";
import { Options } from "preact";
import { createAdapter, setupOptions } from "./adapter";
import { createIdMapper } from "./IdMapper";
import { createBridge } from "./bridge";
import { createRenderer } from "./renderer";

export async function init(options: Options, getHook: () => DevtoolsHook) {
	const ids = createIdMapper();

	const bridge = createBridge(window);
	const adapter = createAdapter(bridge.send, ids, () => getHook().renderers);

	// Add options as early as possible, so that we don't miss the first commit
	setupOptions(options as any, adapter);

	// Devtools can take a while to set up
	await waitForHook(getHook);

	// We're set up and now we can start processing events
	const hook = getHook();

	bridge.listen("initialized", adapter.flushInitial);
	bridge.listen("highlight", adapter.highlight);
	bridge.listen("update-node", ev => {
		adapter.update(ev.id, ev.type, ev.path, ev.value);
	});
	bridge.listen("select", adapter.select);
	bridge.listen("inspect", adapter.inspect);
	bridge.listen("log", adapter.log);
	bridge.listen("update", adapter.log);

	return hook.attach(createRenderer());
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
