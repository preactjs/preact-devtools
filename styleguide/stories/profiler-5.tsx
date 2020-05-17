import { h } from "preact";
import { createStore } from "../../src/view/store";
import { DevTools } from "../../src/view/components/Devtools";
import { Panel } from "../../src/view/store/types";
import * as fixture from "../../src/view/components/profiler/flamegraph/modes/fixtures/patch_new5";
import { recordProfilerCommit } from "../../src/view/components/profiler/data/commits";

const store = createStore();
let rootId = fixture.nodes[0].id;
store.profiler.isSupported.$ = true;
store.activePanel.$ = Panel.PROFILER;
store.profiler.isRecording.$ = true;

store.roots.update(arr => {
	arr.push(rootId);
});

const next = new Map();
fixture.nodes.forEach(node => next.set(node.id, node));
rootId = fixture.commitRoot;
store.nodes.$ = next;

recordProfilerCommit(store.nodes.$, store.profiler, rootId);
store.profiler.isRecording.$ = false;

export function ProfilerDemo5() {
	return (
		<div style="height: 100%">
			<DevTools key="profiler-5" store={store} window={window} />
		</div>
	);
}
