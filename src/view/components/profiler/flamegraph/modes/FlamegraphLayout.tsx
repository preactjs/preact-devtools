import { h, Fragment } from "preact";
import { CommitData } from "../../data/commits";
import { ID, DevNode } from "../../../../store/types";
import { FlameNode } from "../FlameNode";
import { useMemo } from "preact/hooks";
import { FlameNodeTransform, placeFlamegraph } from "./flamegraph-utils";
import { formatTime } from "../../util";
import { useObserver, useStore } from "../../../../store/react-bindings";
import { HocLabels } from "../../../elements/TreeView";
import { getGradient } from "../../data/gradient";

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
	const session = useObserver(() => store.profiler.session.$);
	const data2 = useObserver(() => store.profiler.flamegraphNodes2.$);

	const placed2 = useMemo<FlameNodeTransform[]>(() => {
		const sel = data2.timings.get(selected.id);

		// Should never happen
		if (!sel) return [];

		const matrix = {
			x: -sel.start,
			scale: Math.floor(canvasWidth / sel.width),
		};
		console.log({ data2, matrix });

		const nodes = Array.from(data2.timings.values()).sort(
			(a, b) => a.start - b.start,
		);

		const maximized = new Set<ID>();
		let max = sel;
		while (max.parent !== -1) {
			maximized.add(max.id);
			max = data2.timings.get(max.parent)!;
		}

		const out: FlameNodeTransform[] = [];
		for (let i = 0; i < nodes.length; i++) {
			const n = nodes[i];

			// TODO: Optimize this
			let row = -1;
			let p = n.id;
			while (p !== -1) {
				row++;
				const node = data2.timings.get(p)!;
				p = node.parent;
			}

			out.push({
				commitParent: false,
				id: n.id,
				maximized: maximized.has(n.id),
				row,
				end: (n.start + n.width) * matrix.scale,
				visible: true,
				start: (n.start + matrix.x) * matrix.scale,
				weight: getGradient(50, n.width),
				width: n.width * matrix.scale,
				x: n.start,
			});
		}

		return out;
	}, [data2, selected, canvasWidth]);

	console.log({ placed2 });

	return (
		<Fragment>
			{placed2.map(pos => {
				const node = commit.nodes.get(pos.id)!;

				let appendix = "";
				if (!pos.commitParent && pos.weight !== -1) {
					const t = data2.timings.get(node.id)!;
					const self = formatTime(100);
					const total = formatTime(t.width);
					appendix = ` (${self} of ${total})`;
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
						<span data-testid="node-name">{node.name}</span>
						<HocLabels hocs={node.hocs} nodeId={node.id} canMark={false} />
						{appendix}
					</FlameNode>
				);
			})}
		</Fragment>
	);
}
