import { h } from "preact";
import { useStore, useObserver } from "../../../../store/react-bindings";
import { SidebarPanel, Empty } from "../../../sidebar/SidebarPanel";
import s from "./RenderedAt.css";

export function DebugNodeNav() {
	const store = useStore();
	const selected = useObserver(() => store.profiler.selectedNodeId.$);
	const commit = useObserver(() => store.profiler.activeCommit.$);
	const isRecording = useObserver(() => store.profiler.isRecording.$);

	if (isRecording) {
		return null;
	}

	return (
		<SidebarPanel title="Debug Node Navigation:">
			{!commit ? (
				<Empty>No nodes found inside commmit</Empty>
			) : (
				<nav data-testid="rendered-at">
					{Array.from(commit.nodes.values()).map(node => {
						return (
							<button
								key={node.id}
								class={s.item}
								data-active={selected === node.id}
								onClick={() => (store.profiler.selectedNodeId.$ = node.id)}
							>
								<span style="display: flex; justify-content: space-between; width: 100%">
									<span>{node.name}</span>
									<span>{node.id}</span>
								</span>
							</button>
						);
					})}
				</nav>
			)}
		</SidebarPanel>
	);
}
