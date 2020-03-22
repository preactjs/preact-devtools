import { createStore } from "../../view/store";
import { h, render } from "preact";
import { DevTools } from "../../view/components/Devtools";
import { applyEvent } from "../../adapter/events/events";
import { BaseEvent } from "../../adapter/adapter/port";
import { ClientToDevtools } from "../../constants";

export function setupFrontendStore(ctx: Window) {
	const store = createStore();

	function handleClientEvents(e: any) {
		const detail = (e as CustomEvent<BaseEvent<any, any>>).detail;
		applyEvent(store, detail.type, detail.data);
	}
	ctx.addEventListener(ClientToDevtools, handleClientEvents);

	const unsubscribe = store.subscribe((name, data) => {
		ctx.dispatchEvent(
			new CustomEvent(ClientToDevtools, { detail: { type: name, data } }),
		);
	});

	return {
		store,
		destroy: () => {
			ctx.removeEventListener(ClientToDevtools, handleClientEvents);
			unsubscribe();
		},
	};
}

export function setupInlineDevtools(container: HTMLElement, ctx: Window) {
	const { store } = setupFrontendStore(ctx);
	render(<DevTools store={store} />, container);
}
