import { h, Fragment } from "preact";
import { CommitData } from "../../data/commits";
import { ID, DevNode } from "../../../../store/types";
import { FlameNode } from "../FlameNode";
import { useEffect, useMemo, useRef } from "preact/hooks";
import { placeFlamegraph } from "./flamegraph-utils";
import { formatTime } from "../../util";
import { useObserver, useStore } from "../../../../store/react-bindings";
import { HocLabels } from "../../../elements/TreeView";
import s from "../FlameGraph.module.css";

export interface FlamegraphLayoutProps {
	commit: CommitData;
	selected: DevNode;
	canvasWidth: number;
	onSelect: (id: ID) => void;
	onMouseEnter: (id: ID) => void;
	onMouseLeave: () => void;
}

type StyleCache = {
	commitParent: string;
	gradient: [
		string,
		string,
		string,
		string,
		string,
		string,
		string,
		string,
		string,
		string,
	];
};

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

	const canvasRef = useRef<HTMLCanvasElement>(null);
	const styleCacheRef = useRef<StyleCache>({
		commitParent: "",
		gradient: ["", "", "", "", "", "", "", "", "", ""],
	});
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const styles = window.getComputedStyle(canvas);

		styleCacheRef.current = {
			commitParent: styles.getPropertyValue("--color-profiler-old"),
			gradient: [
				styles.getPropertyValue("--color-profiler-gradient-0"),
				styles.getPropertyValue("--color-profiler-gradient-1"),
				styles.getPropertyValue("--color-profiler-gradient-2"),
				styles.getPropertyValue("--color-profiler-gradient-3"),
				styles.getPropertyValue("--color-profiler-gradient-4"),
				styles.getPropertyValue("--color-profiler-gradient-5"),
				styles.getPropertyValue("--color-profiler-gradient-6"),
				styles.getPropertyValue("--color-profiler-gradient-7"),
				styles.getPropertyValue("--color-profiler-gradient-8"),
				styles.getPropertyValue("--color-profiler-gradient-9"),
			],
		};
	}, []);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		canvas.getContext("2d");
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const w = canvasWidth;
		const h = 260;
		const ratio = window.devicePixelRatio;
		canvas.width = w * ratio;
		canvas.height = h * ratio;
		canvas.style.width = w + "px";
		canvas.style.height = h + "px";
		ctx.scale(ratio, ratio);
		// ctx.imageSmoothingEnabled = false;
		// ctx.translate(0.5, 0.5);

		const styles = styleCacheRef.current;

		placed.forEach((pos, i) => {
			if (!pos.visible) return;

			if (pos.weight > -1) {
				ctx.fillStyle = styles.gradient[pos.weight];
			} else if (pos.commitParent) {
				ctx.fillStyle = styles.commitParent;
			} else {
				ctx.fillStyle = "red";
			}

			const ROW_HEIGHT = 21; // Account 1px for border
			ctx.fillRect(pos.x, pos.row * (ROW_HEIGHT + 1), pos.width, ROW_HEIGHT);

			if (true) {
				const node = commit.nodes.get(pos.id);
				if (!node) return;

				ctx.fillStyle = "black";
				ctx.font = "400 10pt Arial";
				ctx.fillText(node.name, pos.x + 6, pos.row * ROW_HEIGHT + 16);
			}
		});

		console.log(canvas);
	}, []);

	return (
		<div>
			<canvas
				ref={canvasRef}
				class={s.flameCanvas}
				width={canvasWidth}
				height="260"
			/>
			{placed.map(pos => {
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
						commitRootId={commit.commitRootId}
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
			})}
		</div>
	);
}
