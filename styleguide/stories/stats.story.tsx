import { h } from "preact";
import { createStore } from "../../src/view/store";
import { DevTools } from "../../src/view/components/Devtools";
import { Panel } from "../../src/view/store/types";

const store = createStore();

export function StatsDemo() {
	store.activePanel.$ = Panel.STATISTICS;
	return (
		<div style="height: 100%">
			<DevTools store={store} window={window} />
		</div>
	);
}
