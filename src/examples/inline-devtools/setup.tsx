import { createStore } from "../../view/store";
import { h, render } from "preact";
import { DevTools } from "../../view/components/Devtools";
import { DevtoolsHook } from "../../adapter/hook";
import { applyEvent } from "../../adapter/events/events";

export function setupFrontendStore(hook: DevtoolsHook) {
	const store = createStore();

	if (hook.listen == null) {
		console.warn(
			"Injected hook doesn't have a listen() method. " +
				"This usually means that an old version of the 'preact-devtools' extension is running.",
		);
	} else {
		hook.listen((name, data) => {
			applyEvent(store, name, data);
		});
	}

	const unsubscribe = store.subscribe((name, data) => {
		hook.emit(name as any, data);
	});

	return {
		store,
		destroy: () => {
			unsubscribe();
		},
	};
}

export function setupInlineDevtools(
	container: HTMLElement,
	hook: DevtoolsHook,
) {
	const { store } = setupFrontendStore(hook);
	render(<DevTools store={store} />, container);
}
