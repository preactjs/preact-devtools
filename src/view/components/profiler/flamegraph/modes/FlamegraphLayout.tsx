import { h, Fragment } from "preact";
import { CommitData, ProfilerNode } from "../../data/commits";
import { ID } from "../../../../store/types";
import { FlameNode } from "../FlameNode";
import { useMemo } from "preact/hooks";
import { toTransform, placeFlamegraph } from "./flamegraph-utils";
import { formatTime } from "../../util";

export interface FlamegraphLayoutProps {
	commit: CommitData;
	selected: ProfilerNode;
	canvasWidth: number;
	onSelect: (id: ID) => void;
}

export function FlamegraphLayout({
	commit,
	selected,
	canvasWidth,
	onSelect,
}: FlamegraphLayoutProps) {
	const data = useMemo(() => toTransform(commit), [commit]);

	const placed = useMemo(
		() =>
			placeFlamegraph(commit.nodes, data, commit.rootId, selected, canvasWidth),
		[commit, data, selected, canvasWidth],
	);

	// Cache text content to avoid calling `Intl`-API repeatedly
	const texts = useMemo(() => {
		return Array.from(data.values()).map(pos => {
			const node = commit.nodes.get(pos.id)!;
			const self = formatTime(node.selfDuration);
			const total = formatTime(node.treeEndTime - node.treeStartTime);
			return `${node.name} (${self} of ${total})`;
		});
	}, [commit, data]);

	return (
		<Fragment>
			{placed.map((pos, i) => {
				return (
					<FlameNode
						key={pos.id}
						commitRootId={commit.commitRootId}
						node={pos}
						selected={pos.id === selected.id}
						parentId={selected.parent}
						onClick={onSelect}
					>
						{texts[i]}
					</FlameNode>
				);
			})}
		</Fragment>
	);
}
