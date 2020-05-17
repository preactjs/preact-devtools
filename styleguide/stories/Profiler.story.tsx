import { h } from "preact";
import { createStore } from "../../src/view/store";
import { DevTools } from "../../src/view/components/Devtools";
import { Panel, DevNode } from "../../src/view/store/types";
import * as fixture from "../../src/view/components/profiler/flamegraph/modes/fixtures/patch5";
import { recordProfilerCommit } from "../../src/view/components/profiler/data/commits";

function toTree(arr: DevNode[]) {
	return new Map(arr.map(x => [x.id, x]));
}

const store = createStore();
let rootId = fixture.previous[0].id;
store.profiler.isSupported.$ = true;
store.activePanel.$ = Panel.PROFILER;
store.nodes.$ = toTree(fixture.previous);
store.roots.update(arr => {
	arr.push(rootId);
});

store.profiler.isRecording.$ = true;
recordProfilerCommit(store.nodes.$, store.profiler, rootId);

const next = new Map(store.nodes.$);
fixture.next.forEach(node => next.set(node.id, node));
rootId = fixture.next[0].id;
store.nodes.$ = next;

recordProfilerCommit(store.nodes.$, store.profiler, rootId);
store.profiler.isRecording.$ = false;

export function ProfilerDemo() {
	return (
		<div style="height: 100%">
			<DevTools store={store} window={window} />
		</div>
	);
}
