import { h } from "preact";
import { SidebarPanel } from "../../sidebar/SidebarPanel";
import { useStore, useObserver } from "../../../store/react-bindings";

export function RenderReasons() {
	const store = useStore();
	const isRecording = useObserver(() => store.profiler.isRecording.$);
	const commits = useObserver(() => store.profiler.commits.$);

	if (commits.length === 0 || isRecording) {
		return null;
	}

	return (
		<SidebarPanel title="Render reasons" empty="Did not render"></SidebarPanel>
	);
}
