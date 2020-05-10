import { h } from "preact";
import { createStore } from "../../src/view/store";
import { DevTools } from "../../src/view/components/Devtools";
import { Panel, DevNode } from "../../src/view/store/types";
import * as fixture from "../../src/view/components/profiler/flamegraph/transform/fixtures/patch5";
import { recordProfilerCommit } from "../../src/view/components/profiler/data/commits";
import { patchTree } from "../../src/view/components/profiler/flamegraph/transform/patchTree";

function toTree(arr: DevNode[]) {
	return new Map(arr.map(x => [x.id, x]));
}

const store = createStore();
const rootId = fixture.previous[0].id;
store.profiler.isSupported.$ = true;
store.activePanel.$ = Panel.PROFILER;
store.nodes.$ = patchTree(
	new Map(),
	toTree(fixture.previous),
	rootId,
	"expand",
);
store.roots.update(arr => {
	arr.push(rootId);
});

store.profiler.isRecording.$ = true;
recordProfilerCommit(store.nodes.$, store.profiler, rootId);

store.nodes.$ = patchTree(
	store.nodes.$,
	toTree(fixture.next),
	fixture.next[0].id,
	"expand",
);
recordProfilerCommit(store.nodes.$, store.profiler, rootId);
store.profiler.isRecording.$ = false;

export function ProfilerDemo() {
	return (
		<div style="height: 100%">
			<DevTools store={store} window={window} />
		</div>
	);
}
