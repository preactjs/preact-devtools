import { h } from "preact";
import { createStore } from "../../src/view/store";
import { DevTools } from "../../src/view/components/Devtools";
import { Panel } from "../../src/view/store/types";
import * as fixture from "../../src/view/components/profiler/flamegraph/modes/fixtures/patch_new1";
import { recordProfilerCommit } from "../../src/view/components/profiler/data/commits";

const store = createStore();
let rootId = fixture.previous[0].id;
store.profiler.isSupported.$ = true;
store.activePanel.$ = Panel.PROFILER;
store.profiler.isRecording.$ = true;

store.roots.update(arr => {
	arr.push(rootId);
});

let next = new Map();
fixture.first.forEach(node => next.set(node.id, node));
rootId = fixture.firstCommitRoot;
store.nodes.$ = next;

recordProfilerCommit(store.nodes.$, store.profiler, rootId);

next = new Map();
fixture.previous.forEach(node => next.set(node.id, node));
rootId = fixture.previousCommitRoot;
store.nodes.$ = next;

recordProfilerCommit(store.nodes.$, store.profiler, rootId);

next = new Map();
fixture.next.forEach(node => next.set(node.id, node));
rootId = fixture.next[0].id;
store.nodes.$ = next;

recordProfilerCommit(store.nodes.$, store.profiler, rootId);
store.profiler.isRecording.$ = false;

export function ProfilerDemo() {
	return (
		<div style="height: 100%">
			<DevTools key="profiler-2" store={store} window={window} />
		</div>
	);
}
