import { createStore } from "../../view/store";
export { createStore } from "../../view/store";
import { render, h } from "preact";
import { DevTools } from "../../view/components/Devtools";
import { applyEvent } from "../../adapter/events/events";
import { Store } from "../../view/store/types";
import { PageHookName, DevtoolsToClient } from "../../constants";

export function setupFrontendStore(ctx: Window) {
	const store = createStore();

	function handleClientEvents(e: MessageEvent) {
		if (
			e.data &&
			(e.data.source === PageHookName || e.data.source === DevtoolsToClient)
		) {
			const data = e.data;
			applyEvent(store, data.type, data.data);
		}
	}
	ctx.addEventListener("message", handleClientEvents);

	const unsubscribe = store.subscribe((name, data) => {
		ctx.postMessage(
			{
				type: name,
				data,
				source: DevtoolsToClient,
			},
			"*",
		);
	});

	return {
		store,
		destroy: () => {
			ctx.removeEventListener("message", handleClientEvents);
			unsubscribe();
		},
	};
}

export function setupInlineDevtools(container: HTMLElement, ctx: Window) {
	const { store } = setupFrontendStore(ctx);
	render(h(DevTools, { store, window: ctx }), container);
	return store;
}

export function renderDevtools(store: Store, container: HTMLElement) {
	render(h(DevTools, { store, window }), container);
}
