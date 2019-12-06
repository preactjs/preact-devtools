import { DevtoolsHook } from "./hook";
import { Options, Fragment } from "preact";
import { createRenderer } from "./10/renderer";
import { setupOptions } from "./10/options";

export async function init(options: Options, getHook: () => DevtoolsHook) {
	const hook = getHook();
	const renderer = createRenderer(hook, null as any);

	// Add options as early as possible, so that we don't miss the first commit
	setupOptions(options as any, renderer);

	// Devtools can take a while to set up
	await waitForHook(getHook);

	if (hook.attachPreact) {
		return hook.attachPreact("10.0.5", options, {
			Fragment,
		});
	} else {
		console.error(
			"Devtools hook is missing attachPreact() method. " +
				"This happens when the running 'preact-devtools' extension is too old. Please update it.",
		);
	}
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
