import { Fragment, h, RefObject } from "preact";
import { CommitData } from "../../data/commits";
import { ID, DevNode } from "../../../../store/types";
import { FlameNode } from "../FlameNode";
import { useEffect, useMemo } from "preact/hooks";
import { placeFlamegraph } from "../modes/flamegraph-utils";
import { formatTime } from "../../util";
import { useObserver, useStore } from "../../../../store/react-bindings";
import { HocLabels } from "../../../elements/TreeView";
import { NodeTransform } from "../shared";
import { useVirtualizedList } from "../../../elements/VirtualizedList";
import { Minimap } from "./Minimap";

export interface FlamegraphLayoutProps {
	commit: CommitData;
	selected: DevNode;
	canvasWidth: number;
	containerRef: RefObject<HTMLDivElement>;
	onSelect: (id: ID) => void;
	onMouseEnter: (id: ID) => void;
	onMouseLeave: () => void;
}

export function TimelineLayout({
	commit,
	selected,
	canvasWidth,
	onSelect,
	onMouseEnter,
	onMouseLeave,
	containerRef,
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
		<div class="timeline">
			<Minimap />
			<div class="timeline-pane">
				<canvas class="timeline-canvas" style="background: #444" />
			</div>
		</div>
	);
}

function FlameGraphNode({
	commit,
	pos,
	onMouseEnter,
	onMouseLeave,
	selected,
	onSelect,
	filterHoc,
}: {
	commit: CommitData;
	pos: NodeTransform;
	onMouseEnter: (id: number) => void;
	onMouseLeave: () => void;
	selected: DevNode;
	onSelect: (id: number) => void;
	filterHoc: boolean;
}) {
	const node = commit.nodes.get(pos.id)!;
	let appendix = "";
	if (!pos.commitParent && pos.weight !== -1) {
		const self = formatTime(commit.selfDurations.get(pos.id) || 0);
		const total = formatTime(node.endTime - node.startTime);
		appendix = ` (${self} of ${total})`;
	}

	return (
		<FlameNode
			key={pos.id}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
			node={pos}
			name={node.name}
			selected={pos.id === selected.id}
			parentId={commit.nodes.get(pos.id)!.parent}
			onClick={onSelect}
		>
			{node.name}
			{filterHoc && node.hocs ? (
				<HocLabels hocs={node.hocs} nodeId={node.id} canMark={false} />
			) : null}
			{appendix}
		</FlameNode>
	);
}
