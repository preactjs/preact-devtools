import { DevtoolsHook } from "./hook";
import { Options, Fragment } from "preact";

export async function init(options: Options, getHook: () => DevtoolsHook) {
	const hook = getHook();
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
