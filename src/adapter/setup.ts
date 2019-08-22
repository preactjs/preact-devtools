import { DevtoolsHook } from "./hook";
import { Options } from "preact";
import { createAdapter, setupOptions } from "./adapter";
import { createIdMapper } from "./IdMapper";

// // This global variable is injected by the devtools
// let hook = (window as any).__PREACT_DEVTOOLS__ as DevtoolsHook;

export function init(options: Options, hook?: DevtoolsHook) {
	if (!hook) return;

	// TODO: Detect Preact version
	const rendererId = hook.attach(emit => {
		const adapter = createAdapter(emit, createIdMapper());
		setupOptions(options as any, adapter);
		return adapter;
	});

	return rendererId;
}
