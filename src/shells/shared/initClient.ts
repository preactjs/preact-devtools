import { createHook } from "../../adapter/hook";
import { DEBUG } from "../../constants";
import { printCommit } from "../../adapter/debug";

(window as any).__PREACT_DEVTOOLS__ = createHook((ev, data) => {
	switch (ev) {
		case "attach":
			break;
	}
	if (DEBUG) {
		if (ev === "operation") {
			printCommit(data);
		} else {
			console.log("hook", ev, data);
		}
	}

	window.postMessage(
		{
			source: "preact-devtools",
			payload: { name: ev, payload: data },
		},
		"*",
	);
});
