import { createStore } from "../../view/store/index.ts";
export { createStore } from "../../view/store/index.ts";
import { h, render } from "preact";
import { DevTools } from "../../view/components/Devtools.tsx";
import { applyEvent } from "../../adapter/protocol/events.ts";
import { Store } from "../../view/store/types.ts";
import { DevtoolsToClient, PageHookName } from "../../constants.ts";

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
