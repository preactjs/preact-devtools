import { DevtoolsHook } from "./hook";
import { Options } from "preact";
import { createRenderer } from "./10/renderer";
import { setupOptions } from "./10/options";

export async function init(options: Options, getHook: () => DevtoolsHook) {
	const hook = getHook();
	const renderer = createRenderer(hook);

	// Add options as early as possible, so that we don't miss the first commit
	setupOptions(options as any, renderer);

	// Devtools can take a while to set up
	await waitForHook(getHook);

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
