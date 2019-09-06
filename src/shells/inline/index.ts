import { createStore, Store } from "../../view/store";
import { render, h, Options } from "preact";
import { DevTools } from "../../view/components/Devtools";
import { setupOptions, createAdapter } from "../../adapter/adapter";
import { createRenderer } from "../../adapter/renderer";
import { createHook } from "../../adapter/hook";

export function attach(options: Options) {
	const hook = createHook();
	const renderer = createRenderer(hook);
	const destroy = setupOptions(options as any, renderer);

	createAdapter(hook, renderer);
	const store = createStore();

	return {
		store,
		destroy,
	};
}

export type Container = Element | Document | ShadowRoot | DocumentFragment;
export function renderDevtools(store: Store, container: Container) {
	render(h(DevTools, { store }), container);
}
