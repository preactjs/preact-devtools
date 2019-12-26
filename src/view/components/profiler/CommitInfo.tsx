import { h } from "preact";
import { SidebarPanel } from "../sidebar/SidebarPanel";
import { formatTime } from "./util";
import s from "./CommitInfo.css";
import { useStore, useObserver } from "../../store/react-bindings";

export function CommitInfo() {
	const store = useStore();
	const commit = useObserver(() => store.profiler2.activeCommit.$);

	if (commit === null) {
		return null;
	}

	const root = commit.nodes.get(commit.rootId)!;

	return (
		<SidebarPanel title="Commit information" empty="None">
			<dl class={s.list}>
				<dt class={s.title}>Committed at:</dt>
				<dd class={s.value}>{formatTime(root.startTime)}</dd>
				<br />
				<dt class={s.title}>Render duration:</dt>
				<dd class={s.value}>{formatTime(root.duration)}</dd>
			</dl>
		</SidebarPanel>
	);
}
