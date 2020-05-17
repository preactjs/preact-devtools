import { h, Fragment } from "preact";
import { useMemo } from "preact/hooks";
import { placeRanked, toTransform } from "./ranked-utils";
import { CommitData } from "../../data/commits";
import { ID, DevNode } from "../../../../store/types";
import { FlameNode } from "../FlameNode";
import { formatTime } from "../../util";

export interface RankedLayoutProps {
	commit: CommitData;
	selected: DevNode;
	canvasWidth: number;
	onSelect: (id: ID) => void;
}

/**
 * Layout nodes in a flat list from top to bottom
 * in descending order by the time it took a node
 * to render.
 */
export function RankedLayout({
	canvasWidth,
	commit,
	selected,
	onSelect,
}: RankedLayoutProps) {
	// Convert node tree to position data
	const data = useMemo(() => toTransform(commit), [commit]);

	// Update node positions and mutate `data` to avoid allocations
	const placed = useMemo(
		() =>
			placeRanked(
				commit.nodes,
				commit.selfDurations,
				data,
				selected,
				canvasWidth,
			),
		[canvasWidth, selected, commit, data],
	);

	// Cache text content to avoid calling `Intl`-API repeatedly
	const texts = useMemo(() => {
		return data.map(pos => {
			const node = commit.nodes.get(pos.id)!;
			const selfDuration = commit.selfDurations.get(node.id) || 0;
			return `${node.name} (${formatTime(selfDuration)})`;
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
