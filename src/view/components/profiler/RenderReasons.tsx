import { h } from "preact";
import { SidebarPanel } from "../sidebar/SidebarPanel";
import { useStore, useObserver } from "../../store/react-bindings";

export function RenderReasons() {
	const store = useStore();
	const isRecording = useObserver(() => store.profiler2.isRecording.$);
	const commits = useObserver(() => store.profiler2.commits.$);

	if (commits.length === 0 || isRecording) {
		return null;
	}

	return (
		<SidebarPanel
			title="Why did this render?"
			empty="Did not render during this profiling session"
		></SidebarPanel>
	);
}
