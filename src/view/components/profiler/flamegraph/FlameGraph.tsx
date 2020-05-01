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
import { CommitData, FlamegraphType } from "../data/commits";
import { createFlameGraphStore } from "./FlamegraphStore";
import { useInstance, useResize } from "../../utils";
import { ID } from "../../../store/types";

const ROW_HEIGHT = 21; // Account 1px for border

const EMTPY: CommitData = {
	rootId: -1,
	commitRootId: -1,
	maxDepth: 0,
	maxSelfDuration: 0,
	duration: 0,
	nodes: new Map(),
};

const EMPTY_POS = { transform: "", opacity: 0, width: 0 };

export interface TransformData {
	transform: string;
	opacity: number;
	width: number;
}

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

	const cache = useRef(new Map<ID, TransformData>());
	const oldPosition = useMemo(() => {
		const cacheNew = new Map<ID, TransformData>();
		nodes.forEach(node => {
			if (cache.current.has(node.id)) {
				cacheNew.set(node.id, cache.current.get(node.id)!);
			} else {
				cacheNew.set(node.id, { ...EMPTY_POS });
			}
		});
		cache.current = cacheNew;
		return cacheNew;
	}, [commit.commitRootId]);

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

				let pos = oldPosition.get(meta.id);
				if (!pos) {
					pos = { ...EMPTY_POS };
					oldPosition.set(meta.id, pos);
				}
				let property = "opacity";
				if (
					activeParents.has(meta.id) ||
					(x >= 0 && x <= canvasWidth) ||
					(x + width >= 0 && x + width <= canvasWidth)
				) {
					if (pos.opacity > 0) property = "all";
					pos.transform = `translate3d(${x}px,${y}px,0)`;
					pos.opacity = 1;
					pos.width = Math.max(2, width); // 2 for HiDPI screens
				} else {
					pos.opacity = 0;
				}

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
						data-overflow={width <= 32}
						style={{
							width: pos.width,
							height: ROW_HEIGHT,
							opacity: pos.opacity,
							transform: pos.transform,
							transitionProperty: property,
						}}
					>
						<span class={s.text}>
							{node.name} ({formatTime(node.selfDuration)}
							{displayType === FlamegraphType.FLAMEGRAPH &&
								"of " + formatTime(node.treeEndTime - node.treeStartTime)}
							)
						</span>
					</div>
				);
			})}
		</div>
	);
}
