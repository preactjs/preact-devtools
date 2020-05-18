import { h } from "preact";
import { createStore } from "../../src/view/store";
import { DevTools } from "../../src/view/components/Devtools";
import { Panel } from "../../src/view/store/types";
import * as fixture from "../../src/view/components/profiler/flamegraph/modes/fixtures/patch_new3";
import { recordProfilerCommit } from "../../src/view/components/profiler/data/commits";

const store = createStore();
let rootId = fixture.previous[0].id;
store.profiler.isSupported.$ = true;
store.activePanel.$ = Panel.PROFILER;
store.profiler.isRecording.$ = true;

store.roots.update(arr => {
	arr.push(rootId);
});

const next = new Map();
fixture.next.forEach(node => next.set(node.id, node));
rootId = fixture.next[0].id;
store.nodes.$ = next;

recordProfilerCommit(store.nodes.$, store.profiler, rootId);
store.profiler.isRecording.$ = false;

export function ProfilerDemo3() {
	return (
		<div style="height: 100%">
			<DevTools key="profiler-3" store={store} window={window} />
		</div>
	);
}
