import { h } from "preact";
import { SidebarPanel } from "../sidebar/SidebarPanel";
import { formatTime } from "./util";
import s from "./CommitInfo.css";
import { useStore, useObserver } from "../../store/react-bindings";

export function CommitInfo() {
	const store = useStore();
	const commit = useObserver(() => store.profiler.currentCommit.$);

	if (commit === null || commit.length === 0) {
		return null;
	}

	const root = commit[0];

	return (
		<SidebarPanel title="Commit information" empty="None">
			<dl class={s.list}>
				<dt class={s.title}>Committed at:</dt>
				<dd class={s.value}>{root ? formatTime(root.startTime) : "-"}</dd>
				<dt class={s.title}>Render duration:</dt>
				<dd class={s.value}>{root ? formatTime(root.duration) : "-"}</dd>
			</dl>
		</SidebarPanel>
	);
}
