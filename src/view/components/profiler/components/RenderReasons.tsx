import { h } from "preact";
import { SidebarPanel } from "../../sidebar/SidebarPanel";
import { useStore, useObserver } from "../../../store/react-bindings";

export function RenderReasons() {
	const store = useStore();
	const isRecording = useObserver(() => store.profiler.isRecording.$);
	const commits = useObserver(() => store.profiler.commits.$);
	const commit = useObserver(() => store.profiler.activeCommit.$);
	const selected = useObserver(() => store.profiler.selectedNode.$);

	if (commits.length === 0 || isRecording) {
		return null;
	}

	let rendered = false;
	if (commit) {
		const root = commit.nodes.get(commit.commitRootId);
		if (
			root &&
			selected &&
			selected.startTime >= root.startTime &&
			selected.endTime <= root.endTime
		) {
			rendered = true;
		}
	}

	return (
		<SidebarPanel title="Render reasons" empty="Did not render">
			{rendered ? "-" : null}
		</SidebarPanel>
	);
}
