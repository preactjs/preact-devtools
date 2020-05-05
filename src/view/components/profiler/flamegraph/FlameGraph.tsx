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

export function FlameGraph() {
	const store = useStore();

	const displayType = useObserver(() => store.profiler.flamegraphType.$);
	const selectedId = useObserver(() => store.profiler.selectedNodeId.$);
	const nodes = useObserver(() => {
		const commit = store.profiler.activeCommit.$;
		return commit ? commit.nodes : new Map();
	});

	const ref2 = useInstance(() => createFlameGraphStore(store.profiler));
	const positionData = useObserver(() => {
		return !store.profiler.isRecording.$ ? ref2.nodes.$ : [];
	});

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

	return (
		<div class={s.root} ref={ref} data-type={displayType.toLowerCase()}>
			{positionData.map(pos => {
				const node = nodes.get(pos.id)!;
				return (
					<FlameNode
						key={pos.id}
						node={pos}
						onClick={() => onSelect(pos.id)}
						selected={selectedId === pos.id}
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
