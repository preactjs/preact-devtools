import { h } from "preact";
import { SidebarPanel } from "../../../sidebar/SidebarPanel";
import s from "./CommitInfo.module.css";
import { useStore, useObserver } from "../../../../store/react-bindings";
import { getRoot } from "../../flamegraph/FlamegraphStore";
import { getCommitDuration } from "../TimelineBar/TimelineBar";

export function DebugProfilerInfo() {
	const store = useStore();
	const commit = useObserver(() => store.profiler.activeCommit.$);
	const selected = useObserver(() => store.profiler.selectedNode.$);
	const isRecording = useObserver(() => store.profiler.isRecording.$);

	if (commit === null || isRecording || !selected) {
		return null;
	}

	return (
		<SidebarPanel title="Debug Stats" testId="profiler-debug-stats">
			<dl class={s.list}>
				<dt class={s.title}>id:</dt>
				<dd class={s.value}>{selected.id}</dd>
				<br />
				<dt class={s.title}>parentId:</dt>
				<dd class={s.value}>{commit.nodes.get(selected.id)!.parent}</dd>
				<br />
				<dt class={s.title}>rootId:</dt>
				<dd class={s.value}>{getRoot(commit.nodes, selected.id)}</dd>
				<br />
				<dt class={s.title}>selfDuration:</dt>
				<dd class={s.value}>{commit.selfDurations.get(selected.id)}</dd>
				<br />
				<dt class={s.title}>Commit duration:</dt>
				<dd class={s.value}>{getCommitDuration(commit)}</dd>
			</dl>
		</SidebarPanel>
	);
}
