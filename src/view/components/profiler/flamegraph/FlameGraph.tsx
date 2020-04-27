import { h } from "preact";
import s from "./FlameGraph.css";
import { useStore, useObserver } from "../../../store/react-bindings";
import {
	useRef,
	useState,
	useCallback,
	useEffect,
	useMemo,
} from "preact/hooks";
import { formatTime } from "../util";
import { CommitData } from "../data/commits";
import { createFlameGraphStore } from "./FlamegraphStore";
import { useInstance, useResize } from "../../utils";

const ROW_HEIGHT = 21; // Account 1px for border

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
		return store.profiler.activeCommit.$ || EMTPY;
	});

	const selected = useObserver(() => store.profiler.activeCommitIdx.$);

	const ref2 = useInstance(() => createFlameGraphStore(store.profiler));
	const nodes = useObserver(() => ref2.nodes.$);
	const colorMap = useObserver(() => ref2.colors.$);
	const activeParents = useObserver(() => ref2.activeParents.$);
	const selectedNodeId = useObserver(() => store.profiler.selectedNodeId.$);
	const selectedIndex = useMemo(
		() => nodes.findIndex(x => x.id === selectedNodeId),
		[selectedNodeId, nodes],
	);

	const displayType = useObserver(() => store.profiler.flamegraphType.$);
	const [canvasWidth, setWidth] = useState(100);

	const ref = useRef<HTMLDivElement>();
	useEffect(() => {
		if (ref.current) {
			setWidth(ref.current.clientWidth);
		}
	}, [ref.current, selectedNodeId, selected, displayType]);

	useResize(() => {
		if (ref.current) {
			setWidth(ref.current.clientWidth);
		}
	}, []);

	const isRecording = useObserver(() => store.profiler.isRecording.$);

	const onSelect = useCallback(
		(id: number) => {
			store.profiler.selectedNodeId.$ = id;
			store.selection.selectById(id);
		},
		[store],
	);

	if (isRecording || !nodes.length) {
		return null;
	}

	const scale = (canvasWidth || 1) / nodes[0].width;

	return (
		<div class={s.root} ref={ref} data-type={displayType.toLowerCase()}>
			{nodes.map((meta, i) => {
				const x = meta.x * scale;
				const y = meta.row * ROW_HEIGHT;
				const width = meta.width * scale;

				const node = commit.nodes.get(meta.id)!;

				const color = colorMap.get(meta.id);
				return (
					<div
						key={meta.id}
						class={s.node}
						onClick={() => onSelect(meta.id)}
						data-weight={
							color == null && !activeParents.has(meta.id) ? -1 : color
						}
						data-maximized={i <= selectedIndex}
						data-selected={selectedNodeId === meta.id}
						data-overflow={width <= 24}
						style={{
							width: Math.max(2, width), // 2 for HiDPI screens
							height: ROW_HEIGHT,
							transform: `translate3d(${x}px,${y}px,0)`,
						}}
					>
						{node.name} ({formatTime(node.selfDuration)} of{" "}
						{formatTime(node.treeEndTime - node.treeStartTime)})
					</div>
				);
			})}
		</div>
	);
}
