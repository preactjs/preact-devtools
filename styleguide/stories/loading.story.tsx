import { h } from "preact";
import { createStore } from "../../src/view/store";
import { DevTools } from "../../src/view/components/Devtools";

const store = createStore();

export function LoadingDemo() {
	return (
		<div style="height: 100%">
			<DevTools store={store} window={window} />
		</div>
	);
}
