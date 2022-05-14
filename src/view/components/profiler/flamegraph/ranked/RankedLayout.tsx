import { h, Fragment } from "preact";
import { useMemo } from "preact/hooks";
import { ID } from "../../../../store/types";
import { FlameNode } from "../FlameNode";
import { formatTime } from "../../util";
import { useObserver, useStore } from "../../../../store/react-bindings";
import { HocLabels } from "../../../elements/TreeView";
import { layoutRanked, Position } from "../../data/flames";
import { ProfilerCommit } from "../../data/profiler2";
import { getGradient } from "../../data/gradient";

export interface RankedLayoutProps {
	commit: ProfilerCommit;
	selected: ID;
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
	const selectedId = useObserver(() => store.profiler.derivedSelectedNodeId.$);
	const shared = useObserver(() => store.profiler.nodes.$);

	// Build positions
	const original = useMemo(() => {
		return layoutRanked(commit);
	}, [commit]);

	// Apply "zooming"
	const { maximizedIdx, placed } = useMemo(() => {
		let idx = 0;
		let maximized = true;
		let factor = 1;
		const placed = original.map((pos, i) => {
			const width = maximized ? canvasWidth : pos.width * factor;

			if (pos.id === selectedId) {
				maximized = false;
				factor = canvasWidth / pos.width;
				idx = i;
			}

			return {
				id: pos.id,
				start: pos.start,
				width,
				row: i,
			} as Position;
		});

		return {
			placed,
			maximizedIdx: idx,
		};
	}, [original, selectedId, canvasWidth]);

	console.log({
		original,
		placed,
		maximizedIdx,
		selectedId,
		commit,
	});
	return (
		<Fragment>
			{placed.map((pos, i) => {
				const meta = shared.get(pos.id)!;
				const selfDuration = commit.selfDurations.get(pos.id) || 0;

				return (
					<FlameNode
						key={pos.id}
						maximized={i <= maximizedIdx}
						commitRootId={commit.firstId}
						commitParent={false}
						visible={true}
						weight={getGradient(50, selfDuration)}
						pos={pos}
						selected={pos.id === selected}
						onClick={onSelect}
						onMouseEnter={onMouseEnter}
						onMouseLeave={onMouseLeave}
					>
						<span data-testid="node-name">{meta.name}</span>
						<HocLabels hocs={meta.hocs} nodeId={pos.id} canMark={false} /> (
						{formatTime(selfDuration)})
					</FlameNode>
				);
			})}
		</Fragment>
	);
}
