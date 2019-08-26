import { createHook } from "../../adapter/hook";
import { DEBUG } from "../../constants";
import { printCommit } from "../../adapter/debug";

(window as any).__PREACT_DEVTOOLS__ = createHook((ev, data) => {
	switch (ev) {
		case "attach":
			window.postMessage(
				{
					source: "preact-devtools-detector",
				},
				"*",
			);
			break;
		case "operation":
			if (DEBUG) printCommit(data);
			break;
		default:
			console.log("hook", ev, data);
	}

	window.postMessage(
		{
			source: "preact-devtools",
			payload: { name: ev, payload: data },
		},
		"*",
	);
});
