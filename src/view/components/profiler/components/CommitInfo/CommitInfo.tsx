import { h } from "preact";
import { SidebarPanel } from "../../../sidebar/SidebarPanel";
import { formatTime } from "../../util";
import s from "./CommitInfo.module.css";
import { useStore, useObserver } from "../../../../store/react-bindings";
import { getCommitDuration } from "../../data/commits";

export function CommitInfo() {
	const store = useStore();
	const commit = useObserver(() => store.profiler.activeCommit.$);
	const isRecording = useObserver(() => store.profiler.isRecording.$);

	if (commit === null || isRecording) {
		return null;
	}

	const duration = getCommitDuration(commit);

	return (
		<SidebarPanel title="Commit Stats">
			<dl class={s.list}>
				<dt class={s.title}>Duration:</dt>
				<dd class={s.value}>{formatTime(duration)} </dd>
			</dl>
		</SidebarPanel>
	);
}
