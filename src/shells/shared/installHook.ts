import { createHook } from "../../adapter/hook";
import { DEBUG } from "../../constants";
import { printCommit } from "../../adapter/debug";

let ready = false;
window.addEventListener("message", ev => {
	if (
		ev.data.source === "preact-devtools-content-script" &&
		ev.data &&
		ev.data.payload &&
		ev.data.payload.ready
	) {
		ready = true;

		buffer.forEach(data => {
			console.log("flush");
			window.postMessage(
				{
					source: "preact-devtools",
					payload: { name: "operation", payload: data },
				},
				"*",
			);
		});

		buffer = [];
	}
});

let buffer: number[][] = [];

(window as any).__PREACT_DEVTOOLS__ = createHook((ev, data) => {
	switch (ev) {
		case "attach":
			window.postMessage(
				{
					source: "preact-devtools-detector",
				},
				"*",
			);
			return;
		case "operation":
			if (DEBUG) printCommit(data);
			break;
		default:
			console.log("hook", ev, data);
	}

	console.log({ ready });
	if (ready) {
		window.postMessage(
			{
				source: "preact-devtools",
				payload: { name: ev, payload: data },
			},
			"*",
		);
	} else {
		buffer.push(data);
	}
});
