import { h, Fragment } from "preact";
import { ID } from "../../../../store/types";
import { FlameNode } from "../FlameNode";
import { useMemo } from "preact/hooks";
import { formatTime } from "../../util";
import { useObserver, useStore } from "../../../../store/react-bindings";
import { HocLabels } from "../../../elements/TreeView";
import { getGradient } from "../../data/gradient";
import { ProfilerCommit } from "../../data/profiler2";
import { layoutFlameGraph } from "../../data/flames";

export interface FlamegraphLayoutProps {
	commit: ProfilerCommit;
	selected: ID;
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
	const selectedId = useObserver(() => store.profiler.derivedSelectedNodeId.$);
	const shared = useObserver(() => store.profiler.nodes.$);

	// Build positions
	const original = useMemo(() => {
		return layoutFlameGraph(commit);
	}, [commit]);

	const { maximizedIds, commitParentIds, placed } = useMemo(() => {
		const maximizedIds = new Set<ID>();
		const commitParentIds = new Set<ID>();

		return {
			placed: original,
			maximizedIds,
			commitParentIds,
		};
	}, [original, selectedId, canvasWidth]);

	console.log({
		original,
		placed,
		maximizedIds,
		commitParentIds,
		selectedId,
		commit,
	});

	return (
		<Fragment>
			{placed.map(pos => {
				const meta = shared.get(pos.id)!;
				const node = commit.nodes.get(pos.id)!;
				const selfDuration = commit.selfDurations.get(pos.id) || 0;

				const weight = getGradient(50, selfDuration);
				let appendix = "";
				if (!commitParentIds.has(pos.id) && weight !== -1) {
					const totalDuration =
						selfDuration +
						node.children.reduce((acc, id) => {
							return acc + commit.selfDurations.get(id)!;
						}, 0);
					commit.selfDurations;
					const self = formatTime(100);
					const total = formatTime(totalDuration);
					appendix = ` (${self} of ${total})`;
				}

				return (
					<FlameNode
						key={pos.id}
						maximized={false}
						commitRootId={commit.firstId}
						commitParent={false}
						visible={true}
						weight={weight}
						pos={pos}
						selected={pos.id === selected}
						onClick={onSelect}
						onMouseEnter={onMouseEnter}
						onMouseLeave={onMouseLeave}
					>
						<span data-testid="node-name">{meta.name}</span>
						<HocLabels hocs={meta.hocs} nodeId={meta.id} canMark={false} />
						{appendix}
					</FlameNode>
				);
			})}
		</Fragment>
	);
}
