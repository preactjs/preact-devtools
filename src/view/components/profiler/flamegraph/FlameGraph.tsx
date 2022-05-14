import { h } from "preact";
import s from "./FlameGraph.module.css";
import { useStore, useObserver } from "../../../store/react-bindings";
import { useRef, useCallback, useState, useEffect } from "preact/hooks";
import { FlamegraphType } from "../data/commits";
import { useResize } from "../../utils";
import { RankedLayout } from "./ranked/RankedLayout";
import { FlamegraphLayout } from "./modes/FlamegraphLayout";
import { EMPTY } from "./placeNodes";
import { debounce } from "../../../../shells/shared/utils";
import { EmitFn } from "../../../../adapter/hook";
import { ID } from "../../../store/types";

const highlightNode = debounce(
	(notify: EmitFn, id: ID | null) => notify("highlight", id),
	100,
);

export function FlameGraph() {
	const store = useStore();
	const [canvasWidth, setCanvasWidth] = useState(600);

	const displayType = useObserver(() => store.profiler.flamegraphType.$);
	const selected = useObserver(() => store.profiler.derivedSelectedNodeId.$);
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

	const onMouseEnter = useCallback((id: ID) => {
		highlightNode(store.notify, id);
	}, []);

	const onMouseLeave = useCallback(() => {
		highlightNode(store.notify, null);
	}, []);

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
					onMouseEnter={onMouseEnter}
					onMouseLeave={onMouseLeave}
				/>
			) : (
				<FlamegraphLayout
					canvasWidth={canvasWidth}
					commit={commit!}
					onSelect={onSelect}
					selected={selected}
					onMouseEnter={onMouseEnter}
					onMouseLeave={onMouseLeave}
				/>
			)}
		</div>
	);
}
