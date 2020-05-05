import { h } from "preact";
import s from "./FlameGraph.css";
import { useStore, useObserver } from "../../../store/react-bindings";
import { useRef, useState, useCallback, useEffect } from "preact/hooks";
import { formatTime } from "../util";
import { CommitData, FlamegraphType } from "../data/commits";
import { createFlameGraphStore } from "./FlamegraphStore";
import { useInstance, useResize } from "../../utils";
import { FlameNode } from "./FlameNode";

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
	const selectedParents = useObserver(() => ref2.selectedParents.$);
	const selectedNodeId = useObserver(() => store.profiler.selectedNodeId.$);

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
			{nodes.map(meta => {
				const node = commit.nodes.get(meta.id)!;
				const color = colorMap.get(meta.id);

				return (
					<FlameNode
						key={meta.id}
						node={meta}
						canvasWidth={canvasWidth}
						scale={scale}
						onClick={() => onSelect(meta.id)}
						weight={
							color == null && !activeParents.has(meta.id) ? -1 : color || null
						}
						maximized={selectedParents.has(meta.id)}
						selected={selectedNodeId === meta.id}
					>
						{node.name} ({formatTime(node.selfDuration)}
						{displayType === FlamegraphType.FLAMEGRAPH &&
							"of " + formatTime(node.treeEndTime - node.treeStartTime)}
						)
					</FlameNode>
				);
			})}
		</div>
	);
}
