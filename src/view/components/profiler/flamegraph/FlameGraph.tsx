import { h } from "preact";
import s from "./FlameGraph.css";
import {
	useStore,
	useObserver,
	WindowCtx,
} from "../../../store/react-bindings";
import { useRef, useCallback, useContext } from "preact/hooks";
import { formatTime } from "../util";
import { FlamegraphType } from "../data/commits";
import { createFlameGraphStore } from "./FlamegraphStore";
import { useInstance, useResize } from "../../utils";
import { FlameNode } from "./FlameNode";
import { RankedLayout } from "./ranked/RankedLayout";
import { EMPTY } from "./placeNodes";

export function FlameGraph() {
	const store = useStore();

	const displayType = useObserver(() => store.profiler.flamegraphType.$);
	const selectedId = useObserver(() => store.profiler.selectedNodeId.$);
	const commit = useObserver(() => store.profiler.activeCommit.$);
	const ref2 = useInstance(() => createFlameGraphStore(store.profiler));
	const positionData = useObserver(() => {
		return !store.profiler.isRecording.$ ? ref2.nodes.$ : [];
	});
	const canvasWidth = useObserver(() => ref2.canvasWidth.$);

	const win = useContext(WindowCtx) || window;
	if (process.env.DEBUG) {
		(win as any).flamegraph = ref2;
	}

	const ref = useRef<HTMLDivElement>();
	useResize(
		() => {
			if (ref.current) {
				const width = ref.current.clientWidth;
				if (ref2.canvasWidth.$ !== width) {
					ref2.canvasWidth.$ = width;
				}
			}
		},
		[positionData.length],
		true,
	);

	const onSelect = useCallback(
		(id: number) => {
			store.profiler.selectedNodeId.$ = id;
			store.selection.selectById(id);
		},
		[store],
	);

	if (!commit || !positionData.length) return null;

	return (
		<div class={s.root} ref={ref} data-type={displayType.toLowerCase()}>
			{displayType === FlamegraphType.RANKED ? (
				<RankedLayout
					canvasWidth={canvasWidth}
					commit={commit}
					onSelect={onSelect}
					selected={store.profiler.selectedNode.$ || EMPTY}
				/>
			) : (
				positionData.map(pos => {
					const node = commit.nodes.get(pos.id)!;
					return (
						<FlameNode
							key={pos.id}
							parentId={node.parent}
							node={pos}
							commitRootId={commit ? commit.commitRootId : -1}
							onClick={() => onSelect(pos.id)}
							selected={selectedId === pos.id}
						>
							{node.name} ({formatTime(node.selfDuration)}
							{displayType === FlamegraphType.FLAMEGRAPH &&
								" of " + formatTime(node.treeEndTime - node.treeStartTime)}
							)
						</FlameNode>
					);
				})
			)}
		</div>
	);
}
