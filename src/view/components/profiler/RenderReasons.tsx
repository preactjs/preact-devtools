import { h } from "preact";
import { SidebarPanel } from "../sidebar/SidebarPanel";
import { useStore, useObserver } from "../../store/react-bindings";

export function RenderReasons() {
	const store = useStore();
	const commits = useObserver(() => store.profiler.commits.$);

	if (commits.length === 0) {
		return null;
	}

	return (
		<SidebarPanel
			title="Why did this render?"
			empty="Did not render during this profiling session"
		></SidebarPanel>
	);
}
