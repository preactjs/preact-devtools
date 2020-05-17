import { h, Fragment } from "preact";
import { CommitData } from "../../data/commits";
import { ID, DevNode } from "../../../../store/types";
import { FlameNode } from "../FlameNode";
import { useMemo } from "preact/hooks";
import { placeFlamegraph } from "./flamegraph-utils";
import { formatTime } from "../../util";
import { useObserver, useStore } from "../../../../store/react-bindings";

export interface FlamegraphLayoutProps {
	commit: CommitData;
	selected: DevNode;
	canvasWidth: number;
	onSelect: (id: ID) => void;
}

export function FlamegraphLayout({
	commit,
	selected,
	canvasWidth,
	onSelect,
}: FlamegraphLayoutProps) {
	const store = useStore();
	const data = useObserver(() => store.profiler.flamegraphNodes.$);

	const placed = useMemo(
		() =>
			placeFlamegraph(
				commit.nodes,
				data,
				commit.rootId,
				selected.id,
				canvasWidth,
			),
		[commit, data, selected, canvasWidth],
	);

	// Cache text content to avoid calling `Intl`-API repeatedly
	const texts = useMemo(() => {
		return Array.from(data.values()).map(pos => {
			const node = commit.nodes.get(pos.id)!;
			if (pos.commitParent || pos.weight === -1) {
				return node.name;
			}
			const self = formatTime(commit.selfDurations.get(node.id)!);
			const total = formatTime(node.endTime - node.startTime);
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
						parentId={commit.nodes.get(pos.id)!.parent}
						onClick={onSelect}
					>
						{texts[i]}
					</FlameNode>
				);
			})}
		</Fragment>
	);
}
