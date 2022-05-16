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

	// Apply "zoom"
	const { maximizedIds, commitParentIds, placed } = useMemo(() => {
		const maximizedIds = new Set<ID>();
		const commitParentIds = new Set<ID>();

		let parentId = commit.nodes.get(commit.firstId)!.parent;
		while (parentId !== -1) {
			const node = commit.nodes.get(parentId);
			if (node === undefined) break;
			commitParentIds.add(parentId);
			parentId = node.parent;
		}

		parentId = commit.nodes.get(selectedId)!.parent;
		while (parentId !== -1) {
			const node = commit.nodes.get(parentId);
			if (node === undefined) break;
			maximizedIds.add(parentId);
			parentId = node.parent;
		}

		let offset = 0;
		let scale = 1;

		const selectedPos = original.idToPos.get(selectedId);
		if (selectedPos !== undefined) {
			offset = selectedPos.start;
			scale = canvasWidth / selectedPos.width;
		}

		return {
			placed: original.pos.map(pos => {
				let start;
				let width;
				if (maximizedIds.has(pos.id)) {
					start = 0;
					width = canvasWidth;
				} else {
					start = (pos.start - offset) * scale;
					width = pos.width * scale;
				}

				return {
					id: pos.id,
					row: pos.row,
					start,
					width,
				};
			}),
			maximizedIds,
			commitParentIds,
		};
	}, [original, selectedId, canvasWidth]);

	console.log({ commit });

	return (
		<Fragment>
			{placed.map(pos => {
				const meta = shared.get(pos.id)!;

				let weight = -1;
				let appendix = "";
				if (!commitParentIds.has(pos.id) && commit.rendered.has(pos.id)) {
					const selfDuration = commit.selfDurations.get(pos.id)!;
					const totalDuration = commit.renderedDurations.get(pos.id)!;
					weight = getGradient(50, selfDuration);

					const self = formatTime(selfDuration);
					const total = formatTime(totalDuration);
					appendix = ` (${self} of ${total})`;
				}

				return (
					<FlameNode
						key={pos.id}
						maximized={maximizedIds.has(pos.id)}
						commitRootId={commit.firstId}
						commitParent={commitParentIds.has(pos.id)}
						visible={pos.start >= 0 && pos.start <= canvasWidth}
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
