import { h } from "preact";
import s from "./FlameGraph.css";
import { DisplayType } from "./data/ProfilerStore";
import { useStore, useObserver } from "../../store/react-bindings";
import {
	useLayoutEffect,
	useRef,
	useState,
	useCallback,
	useEffect,
} from "preact/hooks";
import { formatTime } from "./util";

const ROW_HEIGHT = 20;

export function FlameGraph() {
	const store = useStore();
	const maxDepth = useObserver(() => store.profiler.maxDepth.$);
	const selected = useObserver(() => store.profiler.selected.$);
	const nodes = useObserver(() => {
		return store.profiler.displayType.$ === DisplayType.FLAMEGRAPH
			? store.profiler.currentCommit.$ || []
			: store.profiler.ranked.$;
	});
	const current = useObserver(() => store.profiler.selectedNodeData.$);
	const currentIndex = useObserver(() => store.profiler.selectedNode.$);
	const displayType = useObserver(() => store.profiler.displayType.$);
	const [width, setWidth] = useState(0);

	const totalDuration = current !== null ? current.duration : 0;
	const step = width / (totalDuration || 1);

	const ref = useRef<HTMLDivElement>();
	useLayoutEffect(() => {
		if (ref.current) {
			setWidth(ref.current.clientWidth);
		}
	}, [nodes, ref.current, selected, displayType]);

	useEffect(() => {
		const listener = () => {
			if (ref.current) {
				setWidth(ref.current.clientWidth);
			}
		};
		window.addEventListener("resize", listener);
		return () => window.removeEventListener("resize", listener);
	}, []);

	const onSelect = useCallback(
		(n: number) => {
			store.profiler.selectedNode.$ = n;
		},
		[store],
	);

	const containerHeight =
		displayType === DisplayType.FLAMEGRAPH
			? (maxDepth + 1) * ROW_HEIGHT
			: nodes.length * ROW_HEIGHT;

	return (
		<div class={s.root} ref={ref} style={`height: ${containerHeight}px`}>
			{nodes.map((node, i) => {
				let x = 0;
				let y = 0;
				let nodeWidth = 0;

				const fullWidth =
					current !== null &&
					(displayType === DisplayType.FLAMEGRAPH
						? current.depth >= node.depth
						: i < currentIndex);

				if (displayType === DisplayType.FLAMEGRAPH) {
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
				} else if (displayType === DisplayType.RANKED) {
					y = i * (ROW_HEIGHT - 2) + i;
					nodeWidth = !fullWidth ? node.duration * step - 1 : width;
				}

				return (
					<div
						key={node.id}
						class={s.node}
						onClick={() => onSelect(i)}
						style={`width: ${nodeWidth}px; transform: translate3d(${x}px,${y}px,0)`}
					>
						{node.name} ({formatTime(node.selfDuration)} of{" "}
						{formatTime(node.duration)})
					</div>
				);
			})}
		</div>
	);
}
