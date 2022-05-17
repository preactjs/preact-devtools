import { h, Fragment } from "preact";
import { useMemo, useEffect } from "preact/hooks";
import { placeRanked } from "./ranked-utils";
import { CommitData } from "../../data/commits";
import { ID, DevNode } from "../../../../store/types";
import { FlameNode } from "../FlameNode";
import { formatTime } from "../../util";
import { useObserver, useStore } from "../../../../store/react-bindings";
import { HocLabels } from "../../../elements/TreeView";

export interface RankedLayoutProps {
	commit: CommitData;
	selected: DevNode;
	canvasWidth: number;
	onSelect: (id: ID) => void;
	onMouseEnter: (id: ID) => void;
	onMouseLeave: () => void;
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
	onMouseEnter,
	onMouseLeave,
}: RankedLayoutProps) {
	// Convert node tree to position data
	const store = useStore();
	const data = useObserver(() => store.profiler.rankedNodes.$);
	const filterHoc = useObserver(() => store.filter.filterHoc.$);

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

	// Hacky
	useEffect(() => {
		if (store.profiler.selectedNodeId.$ === -1 && data.length > 0) {
			store.profiler.selectedNodeId.$ = data[0].id;
		}
	}, [data]);

	return (
		<Fragment>
			{placed.map(pos => {
				const node = commit.nodes.get(pos.id)!;
				const selfDuration = commit.selfDurations.get(node.id) || 0;
				const hocs =
					filterHoc && node.hocs ? (
						<HocLabels hocs={node.hocs} nodeId={node.id} canMark={false} />
					) : (
						""
					);
				const text = (
					<>
						<span data-testid="node-name">{node.name}</span>
						{hocs} ({formatTime(selfDuration)})
					</>
				);
				return (
					<FlameNode
						key={pos.id}
						node={pos}
						selected={pos.id === selected.id}
						parentId={selected.parent}
						onClick={onSelect}
						name={node.name}
						onMouseEnter={onMouseEnter}
						onMouseLeave={onMouseLeave}
					>
						{text}
					</FlameNode>
				);
			})}
		</Fragment>
	);
}
