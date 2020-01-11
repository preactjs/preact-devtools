import { h } from "preact";
import { SidebarPanel } from "../../../sidebar/SidebarPanel";
import { formatTime } from "../../util";
import s from "./CommitInfo.css";
import { useStore, useObserver } from "../../../../store/react-bindings";

export function CommitInfo() {
	const store = useStore();
	const commit = useObserver(() => store.profiler.activeCommit.$);
	const isRecording = useObserver(() => store.profiler.isRecording.$);

	if (commit === null || isRecording) {
		return null;
	}

	const root = commit.nodes.get(commit.commitRootId)!;

	return (
		<SidebarPanel title="Commit Stats" empty="None">
			<dl class={s.list}>
				<dt class={s.title}>Start:</dt>
				<dd class={s.value}>{formatTime(root.startTime)}</dd>
				<br />
				<dt class={s.title}>Duration:</dt>
				<dd class={s.value}>{formatTime(root.endTime - root.startTime)}</dd>
			</dl>
		</SidebarPanel>
	);
}
