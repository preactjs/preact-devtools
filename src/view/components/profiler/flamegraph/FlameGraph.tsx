import { h } from "preact";
import s from "./FlameGraph.css";
import { useStore, useObserver } from "../../../store/react-bindings";
import {
	useLayoutEffect,
	useRef,
	useState,
	useCallback,
	useEffect,
} from "preact/hooks";
import { formatTime } from "../util";
import { CommitData, FlamegraphType } from "../../../store/commits";
import { flattenChildren } from "../../tree/windowing";
import { createFlameGraphStore } from "./FlamegraphStore";
import { useInstance } from "../../utils";

const ROW_HEIGHT = 20;

const EMTPY: CommitData = {
	rootId: -1,
	commitRootId: -1,
	maxDepth: 0,
	maxSelfDuration: 0,
	duration: 0,
	nodes: new Map(),
};

export function FlameGraph() {
	const store = useStore();
	const commit = useObserver(() => {
		return store.profiler2.activeCommit.$ || EMTPY;
	});

	const selected = useObserver(() => store.profiler2.activeCommitIdx.$);
	const { maxDepth } = commit;

	const nodes = useObserver(() => {
		const maybeCommit = store.profiler2.activeCommit.$;
		if (!maybeCommit) {
			return [];
		}
		const list = flattenChildren(
			maybeCommit.nodes,
			maybeCommit.rootId,
			new Set(),
		).map(x => maybeCommit.nodes.get(x)!);

		return store.profiler2.flamegraphType.$ === FlamegraphType.TIMELINE
			? list
			: list.slice().sort((a, b) => b.selfDuration - a.selfDuration);
	});

	const ref2 = useInstance(() => createFlameGraphStore(store.profiler2));
	const ref2nodes = useObserver(() => ref2.nodes.$);
	console.log(ref2.nodes.$);

	const current = useObserver(() => store.profiler2.selectedNode.$);
	const currentIndex = useObserver(() => store.profiler2.selectedNodeId.$);
	const displayType = useObserver(() => store.profiler2.flamegraphType.$);
	const maxDuration = commit.duration;
	const [width, setWidth] = useState(0);

	const totalDuration =
		current !== null
			? displayType === FlamegraphType.TIMELINE
				? current.duration
				: current.selfDuration
			: 0;
	const step = width / (totalDuration || 1);

	const ref = useRef<HTMLDivElement>();
	useLayoutEffect(() => {
		if (ref.current) {
			setWidth(ref.current.clientWidth);
		}
	}, [ref.current, selected, displayType]);

	useEffect(() => {
		const listener = () => {
			if (ref.current) {
				setWidth(ref.current.clientWidth);
			}
		};
		window.addEventListener("resize", listener);
		return () => window.removeEventListener("resize", listener);
	}, []);

	const isRecording = useObserver(() => store.profiler2.isRecording.$);

	const onSelect = useCallback(
		(id: number) => {
			store.profiler2.selectedNodeId.$ = id;
		},
		[store],
	);

	const containerHeight =
		displayType === FlamegraphType.TIMELINE
			? (maxDepth + 1) * ROW_HEIGHT
			: nodes.length * ROW_HEIGHT;

	if (isRecording) {
		return null;
	}

	return (
		<div class={s.root} ref={ref} style={`height: ${containerHeight}px`}>
			{ref2nodes.map(meta => {
				const { id, width, x, y, color } = meta;
				const node = commit.nodes.get(meta.id)!;

				console.log(node.name, displayType, meta);
				return (
					<div
						key={id}
						class={s.node}
						onClick={() => onSelect(id)}
						style={`width: ${width}px; transform: translate3d(${x}px,${y}px,0); background: ${color}`}
					>
						{node.name} ({formatTime(node.selfDuration)} of{" "}
						{formatTime(node.duration)})
					</div>
				);
			})}
			{/* {nodes.map((node, i) => {
				let x = 0;
				let y = 0;
				let nodeWidth = 0;

				const fullWidth =
					current !== null &&
					(displayType === FlamegraphType.TIMELINE
						? current.depth >= node.depth
						: i < currentIndex);

				if (displayType === FlamegraphType.TIMELINE) {
					if (current !== null) {
						// Check if it's out of view
						if (current.depth >= node.depth) {
							if (node.startTime > current.startTime) {
								x = width;
							} else if (
								node.startTime < current.startTime &&
								node.startTime + node.duration < current.startTime
							) {
								x = -(node.startTime - node.duration) * step;
							}
						} else {
							// Calculate new start time by subtracting maximized node's start time
							const newStart =
								node.startTime - (current !== null ? current.startTime : 0);

							x = newStart * step;
						}
					}

					y = node.depth * (ROW_HEIGHT - 2) + node.depth;
					nodeWidth = !fullWidth ? node.duration * step - 1 : width;
				} else if (displayType === FlamegraphType.RANKED) {
					y = i * (ROW_HEIGHT - 2) + i;
					nodeWidth = !fullWidth ? node.selfDuration * step - 1 : width;
				}

				const color = getGradient(node.selfDuration / maxDuration);

				// Ensure that a node is always visible
				nodeWidth = Math.max(6, nodeWidth);

				return (
					<div
						key={node.id}
						class={s.node}
						onClick={() => onSelect(node.id)}
						style={`width: ${nodeWidth}px; transform: translate3d(${x}px,${y}px,0); background: ${color}`}
					>
						{node.name} ({formatTime(node.selfDuration)} of{" "}
						{formatTime(node.duration)})
					</div>
				);
			})} */}
		</div>
	);
}
