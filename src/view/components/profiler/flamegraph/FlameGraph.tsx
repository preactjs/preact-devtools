import { h } from "preact";
import s from "./FlameGraph.css";
import { useStore, useObserver } from "../../../store/react-bindings";
import { useRef, useCallback, useState, useEffect } from "preact/hooks";
import { FlamegraphType } from "../data/commits";
import { useResize } from "../../utils";
import { RankedLayout } from "./ranked/RankedLayout";
import { FlamegraphLayout } from "./modes/FlamegraphLayout";
import { EMPTY } from "./placeNodes";

export function FlameGraph() {
	const store = useStore();
	const [canvasWidth, setCanvasWidth] = useState(600);

	const displayType = useObserver(() => store.profiler.flamegraphType.$);
	const selected = useObserver(() => store.profiler.selectedNode.$ || EMPTY);
	const commit = useObserver(() => store.profiler.activeCommit.$);
	const isRecording = useObserver(() => store.profiler.isRecording.$);
	const showDebug = useObserver(() => store.debugMode.$);

	const ref = useRef<HTMLDivElement>();
	useEffect(() => {
		if (ref.current) {
			setCanvasWidth(ref.current.clientWidth);
		}
	}, [isRecording || !commit]);
	useResize(() => {
		if (ref.current) {
			setCanvasWidth(ref.current.clientWidth);
		}
	}, []);

	const onSelect = useCallback(
		(id: number) => {
			store.profiler.selectedNodeId.$ = id;
			store.selection.selectById(id);
		},
		[store],
	);

	if (isRecording || !commit) return null;

	return (
		<div
			class={s.root}
			ref={ref}
			data-type={displayType.toLowerCase()}
			style={showDebug ? "overflow-x: auto" : ""}
		>
			{displayType === FlamegraphType.RANKED ? (
				<RankedLayout
					canvasWidth={canvasWidth}
					commit={commit!}
					onSelect={onSelect}
					selected={selected}
				/>
			) : (
				<FlamegraphLayout
					canvasWidth={canvasWidth}
					commit={commit!}
					onSelect={onSelect}
					selected={selected}
				/>
			)}
		</div>
	);
}
