import { h } from "preact";
import { useStore, useObserver } from "../../store/react-bindings";
import { SidebarPanel } from "../sidebar/SidebarPanel";
import s from "./RenderedAt.css";
import { formatTime } from "./util";

export function RenderedAt() {
	const store = useStore();
	const commits = useObserver(() => store.profiler.commits.$);
	const current = useObserver(() => store.profiler.selectedNodeData.$);

	if (commits.length === 0 || current === null) return null;

	return (
		<SidebarPanel title="Rendered at:" empty="none">
			<nav>
				<button class={s.item} data-active={true}>
					<span>
						{formatTime(current.startTime)} for {formatTime(current.duration)}
					</span>
				</button>
			</nav>
		</SidebarPanel>
	);
}
