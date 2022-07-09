import { Fragment, h } from "preact";
import { useStore, useObserver } from "../../../../store/react-bindings";
import { SidebarPanel, Empty } from "../../../sidebar/SidebarPanel";
import { formatTime } from "../../util";

export function RenderedAt() {
	const store = useStore();
	const commit = useObserver(() => store.profiler.activeCommit.$);
	const selected = useObserver(() => store.profiler.selectedNodeId.$);
	const data = useObserver(() => {
		const id = store.profiler.selectedNodeId.$;

		return store.profiler.commits.$.reduce<
			Array<{ index: number; selfDuration: number }>
		>((acc, commit, i) => {
			if (!commit.rendered.has(id)) return acc;

			const selfDuration = commit.selfDurations.get(id) || 0;
			acc.push({
				index: i,
				selfDuration,
			});
			return acc;
		}, []);
	});

	const commitIdx = useObserver(() => store.profiler.activeCommitIdx.$);

	if (commit === null) return null;

	const commitRoot = commit.nodes.get(commit.commitRootId)!;

	return (
		<Fragment>
			<SidebarPanel title="Commit Root:">
				<nav data-testid="commitRoot">
					<button
						class="rendered-at-item"
						data-active={selected === commit.commitRootId}
						onClick={() =>
							(store.profiler.selectedNodeId.$ = commit.commitRootId)
						}
					>
						<span>{commitRoot.name}</span>
					</button>
				</nav>
			</SidebarPanel>

			{data.length > 0 && (
				<SidebarPanel title="Rendered at:">
					{data.length <= 0 ? (
						<Empty>Did not render during this profiling session</Empty>
					) : (
						<nav data-testid="rendered-at">
							{data.map(node => {
								return (
									<button
										key={node.index}
										class="rendered-at-item"
										data-active={commitIdx === node.index}
										onClick={() =>
											(store.profiler.activeCommitIdx.$ = node.index)
										}
									>
										<span>
											Commit #{node.index} for {formatTime(node.selfDuration)}
										</span>
									</button>
								);
							})}
						</nav>
					)}
				</SidebarPanel>
			)}
		</Fragment>
	);
}
