import { createStore } from "../../view/store";
import { h, render } from "preact";
import { DevTools } from "../../view/components/Devtools";
import { applyEvent } from "../../adapter/events/events";
import { ClientToDevtools, DevtoolsPanelInlineName } from "../../constants";

export function setupFrontendStore(ctx: Window) {
	const store = createStore();

	function handleClientEvents(e: MessageEvent) {
		if (e.source === window && e.data && e.data.type) {
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
				source: DevtoolsPanelInlineName,
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
	render(<DevTools store={store} />, container);
}
