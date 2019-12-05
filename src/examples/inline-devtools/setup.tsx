import { createStore } from "../../view/store";
import { h, render } from "preact";
import { DevTools } from "../../view/components/Devtools";
import { DevtoolsHook } from "../../adapter/hook";
import { applyEvent } from "../../adapter/events";

export function setupInlineDevtools(
	container: HTMLElement,
	hook: DevtoolsHook,
) {
	const store = createStore();

	hook.listen((name, data) => {
		applyEvent(store, name, data);
	});

	store.subscribe((name, data) => {
		hook.emit(name, data);
	});

	render(<DevTools store={store} />, container);
}
