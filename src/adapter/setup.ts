import { DevtoolsHook } from "./hook";
import { Options } from "preact";
import { createAdapter, setupOptions } from "./adapter";
import { createIdMapper } from "./IdMapper";

let timeout = 0;
export function init(options: Options, getHook: () => DevtoolsHook) {
	const hook = getHook();
	// Devtools might take a bit to load
	if (!hook) {
		setTimeout(() => init(options, getHook), 500);
		return;
	}

	clearTimeout(timeout);

	// TODO: Detect Preact version
	const rendererId = hook.attach(emit => {
		const adapter = createAdapter(emit, createIdMapper());
		setupOptions(options as any, adapter);
		return adapter;
	});

	return rendererId;
}
