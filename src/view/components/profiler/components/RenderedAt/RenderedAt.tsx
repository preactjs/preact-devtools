import { h } from "preact";
import { useStore, useObserver } from "../../../../store/react-bindings";
import { SidebarPanel, Empty } from "../../../sidebar/SidebarPanel";
import s from "./RenderedAt.module.css";
import { formatTime } from "../../util";
import { useMemo } from "preact/hooks";

export function RenderedAt() {
	const store = useStore();
	const selectedNode = useObserver(() => store.profiler.selectedNode.$);
	const commits = useObserver(() => store.profiler.commits.$);

	const data = useMemo(() => {
		if (!selectedNode) return [];

		const items: { index: number; startTime: number; duration: number }[] = [];

		const commits = store.profiler.commits.$;
		for (let i = 0; i < commits.length; i++) {
			const commit = commits[i];
			if (commit.rendered.has(selectedNode.id)) {
				const commitDuration = Array.from(commit.selfDurations.values()).reduce(
					(acc, x) => acc + x,
					0,
				);

				items.push({
					index: i,
					startTime: commit.start,
					duration: commitDuration,
				});
			}
		}

		return items;
	}, [selectedNode, commits]);

	const commitIdx = useObserver(() => store.profiler.activeCommitIdx.$);

	if (data.length <= 0) return null;

	return (
		<SidebarPanel title="Rendered at:">
			{data.length <= 0 ? (
				<Empty>Did not render during this profiling session</Empty>
			) : (
				<nav data-testid="rendered-at">
					{data.map((node, i) => {
						return (
							<button
								key={i}
								class={s.item}
								data-active={commitIdx === node.index}
								onClick={() => (store.profiler.activeCommitIdx.$ = node.index)}
							>
								<span>
									{formatTime(node.startTime / 1000)} for{" "}
									{formatTime(node.duration)}
								</span>
							</button>
						);
					})}
				</nav>
			)}
		</SidebarPanel>
	);
}
