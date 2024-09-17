import { h } from "preact";
import { SidebarPanel } from "../../../sidebar/SidebarPanel.tsx";
import { formatTime } from "../../util.ts";
import { useStore } from "../../../../store/react-bindings.ts";

export function CommitInfo() {
	const store = useStore();
	const commit = store.profiler.activeCommit.value;
	const isRecording = store.profiler.isRecording.value;

	if (commit === null || isRecording) {
		return null;
	}

	const root = commit.nodes.get(commit.commitRootId)!;
	if (!root) {
		return null;
	}

	return (
		<SidebarPanel title="Commit Stats">
			<dl class="commit-info-list">
				<dt class="commit-info-title">Start:</dt>
				<dd class="commit-info-value">{formatTime(root.startTime)}</dd>
				<br />
				<dt class="commit-info-title">Duration:</dt>
				<dd class="commit-info-value">{formatTime(commit.duration)}</dd>
			</dl>
		</SidebarPanel>
	);
}
