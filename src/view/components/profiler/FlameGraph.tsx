import { h } from "preact";
import s from "./FlameGraph.css";
import { ProfilerNode } from "./data/ProfilerStore";
import { useStore, useObserver } from "../../store/react-bindings";
import {
	useLayoutEffect,
	useRef,
	useState,
	useCallback,
	useEffect,
} from "preact/hooks";

export interface FlameGraphProps {
	// nodes: ProfilerNode[];
}

const ROW_HEIGHT = 20;

export function FlameGraph(props: FlameGraphProps) {
	const store = useStore();
	const nodes = useObserver(() => store.profiler.commits.$[0]);
	const maxDepth = useObserver(() => store.profiler.maxDepth.$);
	const selected = useObserver(() => store.profiler.selected.$);
	const current = useObserver(() => store.profiler.selectedNodeData.$);
	const [width, setWidth] = useState(0);

	const totalDuration = current !== null ? current.duration : 0;
	const step = width / (totalDuration || 1);

	const ref = useRef<HTMLDivElement>();
	useLayoutEffect(() => {
		if (ref.current) {
			setWidth(ref.current.clientWidth);
		}
	}, [nodes, ref.current, selected]);

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

	return (
		<div
			class={s.root}
			ref={ref}
			style={`height: ${(maxDepth + 1) * ROW_HEIGHT}px`}
		>
			{nodes.map((node, i) => {
				const fullWidth = current !== null && current.depth >= node.depth;
				const self = (node.selfDuration < 0.1 ? "< " : "") + node.selfDuration;

				let x = 0;
				if (current !== null && !fullWidth) {
					// Calculate new start time by subtracting maximized node's start time
					const newStart =
						node.startTime - (current !== null ? current.startTime : 0);

					// If it's larger than the maximized node's duration, we hide it
					x = newStart > current.duration ? width : newStart * step;
				}

				const y = node.depth * (ROW_HEIGHT - 2) + node.depth;
				const nodeWidth = !fullWidth ? node.duration * step : width;

				return (
					<div
						key={node.id}
						class={s.node}
						onClick={() => onSelect(i)}
						style={`width: ${nodeWidth -
							1}px; transform: translate3d(${x}px,${y}px,0)`}
					>
						{node.name} ({self}ms of {node.duration}ms)
					</div>
				);
			})}
		</div>
	);
}
