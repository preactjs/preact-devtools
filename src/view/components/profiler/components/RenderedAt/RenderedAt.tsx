import { h } from "preact";
import { useStore, useObserver } from "../../../../store/react-bindings";
import { SidebarPanel } from "../../../sidebar/SidebarPanel";
import s from "./RenderedAt.css";
import { formatTime } from "../../util";
import { mapParents } from "../../flamegraph/transform/util";

export function RenderedAt() {
	const store = useStore();
	const data = useObserver(() => {
		const id = store.profiler.selectedNodeId.$;

		return store.profiler.commits.$.filter(x => x.nodes.has(id))
			.filter(x => {
				if (id === x.commitRootId) return true;
				let keep = false;
				mapParents(x.nodes, id, node => {
					if (node.id === x.commitRootId) keep = true;
				});
				return keep;
			})
			.map((commit, commitIdx) => {
				const node = commit.nodes.get(id)!;
				return {
					id: commitIdx,
					startTime: node.startTime,
					selfDuration: node.selfDuration,
				};
			});
	});

	const commitIdx = useObserver(() => store.profiler.activeCommitIdx.$);

	if (data.length <= 0) return null;

	return (
		<SidebarPanel
			title="Rendered at:"
			isEmpty={data.length <= 0}
			empty="Did not render during this profiling session"
		>
			<nav>
				{data.map(node => {
					return (
						<button
							key={node.id}
							class={s.item}
							data-active={commitIdx === node.id}
							onClick={() => (store.profiler.activeCommitIdx.$ = node.id)}
						>
							<span>
								{formatTime(node.startTime)} for {formatTime(node.selfDuration)}
							</span>
						</button>
					);
				})}
			</nav>
		</SidebarPanel>
	);
}
