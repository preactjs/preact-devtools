import { h, Fragment } from "preact";
import { SidebarPanel } from "../../../sidebar/SidebarPanel";
import s from "./CommitInfo.css";
import { useStore, useObserver } from "../../../../store/react-bindings";

const TimeRange = ({ from, to }: { from: number; to: number }) => (
	<Fragment>
		{from.toFixed(2)} -&gt; {to.toFixed(2)}
	</Fragment>
);

export function DebugProfilerInfo() {
	const store = useStore();
	const commit = useObserver(() => store.profiler.activeCommit.$);
	const selected = useObserver(() => store.profiler.selectedNode.$);
	const isRecording = useObserver(() => store.profiler.isRecording.$);

	if (commit === null || isRecording || !selected) {
		return null;
	}

	return (
		<SidebarPanel title="Debug Stats">
			<dl class={s.list}>
				<dt class={s.title}>id:</dt>
				<dd class={s.value}>{selected.id}</dd>
				<br />
				<dt class={s.title}>parentId:</dt>
				<dd class={s.value}>{selected.parent}</dd>
				<br />
				<dt class={s.title}>tree:</dt>
				<dd class={s.value}>
					<TimeRange from={selected.treeStartTime} to={selected.treeEndTime} />
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
