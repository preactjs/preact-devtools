import { h } from "preact";
import { useStore, useObserver } from "../../store/react-bindings";
import { SidebarPanel } from "../sidebar/SidebarPanel";
import s from "./RenderedAt.css";
import { formatTime } from "./util";

export function RenderedAt() {
	const store = useStore();
	const data = useObserver(() => {
		const id = store.profiler2.selectedNodeId.$;

		return store.profiler2.commits.$.filter(x => x.nodes.has(id)).map(
			(commit, commitIdx) => {
				const node = commit.nodes.get(id)!;
				return {
					id: commitIdx,
					startTime: node.startTime,
					duration: node.duration,
				};
			},
		);
	});

	const commitIdx = useObserver(() => store.profiler2.activeCommitIdx.$);

	if (data.length <= 0) return null;

	return (
		<SidebarPanel title="Rendered at:" empty="none">
			<nav>
				{data.map(node => {
					return (
						<button
							key={node.id}
							class={s.item}
							data-active={commitIdx === node.id}
							onClick={() => (store.profiler2.activeCommitIdx.$ = node.id)}
						>
							<span>
								{formatTime(node.startTime)} for {formatTime(node.duration)}
							</span>
						</button>
					);
				})}
			</nav>
		</SidebarPanel>
	);
}
