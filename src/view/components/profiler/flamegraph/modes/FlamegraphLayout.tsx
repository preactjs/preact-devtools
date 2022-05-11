import { h, Fragment } from "preact";
import { CommitData } from "../../data/commits";
import { ID, DevNode } from "../../../../store/types";
import { FlameNode } from "../FlameNode";
import { useMemo } from "preact/hooks";
import { placeFlamegraph } from "./flamegraph-utils";
import { formatTime } from "../../util";
import { useObserver, useStore } from "../../../../store/react-bindings";
import { HocLabels } from "../../../elements/TreeView";

export interface FlamegraphLayoutProps {
	commit: CommitData;
	selected: DevNode;
	canvasWidth: number;
	onSelect: (id: ID) => void;
	onMouseEnter: (id: ID) => void;
	onMouseLeave: () => void;
}

export function FlamegraphLayout({
	commit,
	selected,
	canvasWidth,
	onSelect,
	onMouseEnter,
	onMouseLeave,
}: FlamegraphLayoutProps) {
	const store = useStore();
	const data = useObserver(() => store.profiler.flamegraphNodes.$);
	const filterHoc = useObserver(() => store.filter.filterHoc.$);

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

	return (
		<Fragment>
			{placed.map(pos => {
				const node = commit.nodes.get(pos.id)!;
				let text: any = "";
				if (pos.commitParent || pos.weight === -1) {
					text = (
						<>
							<span data-testid="node-name">{node.name}</span>
							{filterHoc && node.hocs ? (
								<HocLabels hocs={node.hocs} nodeId={node.id} canMark={false} />
							) : (
								""
							)}
						</>
					);
				} else {
					const self = formatTime(commit.selfDurations.get(node.id)!);
					const total = formatTime(node.endTime - node.startTime);
					text = (
						<>
							<span data-testid="node-name">{node.name}</span>
							{filterHoc && node.hocs ? (
								<HocLabels hocs={node.hocs} nodeId={node.id} canMark={false} />
							) : (
								""
							)}{" "}
							({self} of {total})
						</>
					);
				}

				return (
					<FlameNode
						key={pos.id}
						onMouseEnter={onMouseEnter}
						onMouseLeave={onMouseLeave}
						commitRootId={commit.commitRootId}
						node={pos}
						name={node.name}
						selected={pos.id === selected.id}
						parentId={commit.nodes.get(pos.id)!.parent}
						onClick={onSelect}
					>
						{text}
					</FlameNode>
				);
			})}
		</Fragment>
	);
}
