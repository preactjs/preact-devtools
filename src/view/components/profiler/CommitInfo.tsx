import { h } from "preact";
import { SidebarPanel } from "../sidebar/SidebarPanel";
import { formatTime } from "./util";
import s from "./CommitInfo.css";
import { useStore, useObserver } from "../../store/react-bindings";

export function CommitInfo() {
	const store = useStore();
	const commit = useObserver(() => store.profiler.selectedNodeData.$);
	const commits = useObserver(() => store.profiler.commits.$);

	if (commits.length === 0) {
		return null;
	}

	return (
		<SidebarPanel title="Commit information" empty="None">
			<dl class={s.list}>
				<dt class={s.title}>Committed at:</dt>
				<dd class={s.value}>{commit ? formatTime(commit.startTime) : "-"}</dd>
				<dt class={s.title}>Render duration:</dt>
				<dd class={s.value}>{commit ? formatTime(commit.duration) : "-"}</dd>
			</dl>
		</SidebarPanel>
	);
}
