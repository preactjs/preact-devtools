import { h, Fragment } from "preact";
import { SidebarPanel } from "../../../sidebar/SidebarPanel";
import s from "./CommitInfo.module.css";
import { useStore, useObserver } from "../../../../store/react-bindings";
import { getRoot } from "../../flamegraph/FlamegraphStore";

const TimeRange = ({ from, to }: { from: number; to: number }) => (
	<Fragment>
		{from.toFixed(2)} -&gt; {to.toFixed(2)} | {(to - from).toFixed(2)}
	</Fragment>
);

export function DebugProfilerInfo() {
	const store = useStore();
	const commit = useObserver(() => store.profiler.activeCommit.$);
	const selected = useObserver(() => store.profiler.selectedNode.$);
	const isRecording = useObserver(() => store.profiler.isRecording.$);
	const pos = useObserver(() => {
		const s = store.profiler.selectedNodeId.$;
		return store.profiler.flamegraphNodes.$.get(s);
	})!;

	if (commit === null || isRecording || !selected || !pos) {
		return null;
	}

	return (
		<SidebarPanel title="Debug Stats" testId="profiler-debug-stats">
			<dl class={s.list}>
				<dt class={s.title}>id:</dt>
				<dd class={s.value}>{selected.id}</dd>
				<br />
				<dt class={s.title}>parentId:</dt>
				<dd class={s.value}>{selected.parent}</dd>
				<br />
				<dt class={s.title}>rootId:</dt>
				<dd class={s.value}>{getRoot(commit.nodes, selected.id)}</dd>
				<br />
				<dt class={s.title}>tree:</dt>
				<dd class={s.value}>
					<TimeRange from={pos.x} to={pos.x + pos.width} />
				</dd>
				<br />
				<dt class={s.title}>real:</dt>
				<dd class={s.value}>
					<TimeRange from={selected.startTime} to={selected.endTime} />
				</dd>
			</dl>
		</SidebarPanel>
	);
}
