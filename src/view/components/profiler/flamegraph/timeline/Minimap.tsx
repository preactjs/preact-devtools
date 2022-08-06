import { h } from "preact";
import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import { useObserver, useStore } from "../../../../store/react-bindings";
import { useResize } from "../../../utils";

export type DragTarget = "none" | "marker-left" | "marker-right" | "pane";

export function Minimap() {
	const ref = useRef<HTMLCanvasElement>();
	const [size, setSize] = useState({ min: 0, max: 100 });
	const [left, setLeft] = useState(0);
	const [right, setRight] = useState(100);

	const leftRef = useRef(left);
	const rightRef = useRef(right);
	leftRef.current = left;
	rightRef.current = right;

	// User interactions
	const [drag, setDrag] = useState<DragTarget>("none");

	useResize(
		() => {
			if (!ref.current) return;
			const rect = ref.current.getBoundingClientRect();
			setSize({ min: rect.left, max: rect.right - rect.left });
		},
		[],
		true,
	);

	useEffect(() => {
		const MARKER_WIDTH = 12 + 4; // width + gap;
		const fn = (e: PointerEvent) => {
			switch (drag) {
				case "marker-left":
					setLeft(
						Math.max(
							0,
							Math.min(
								size.max,
								rightRef.current - MARKER_WIDTH,
								e.clientX - size.min,
							),
						),
					);
					break;
				case "marker-right":
					setRight(
						Math.max(
							0,
							leftRef.current + MARKER_WIDTH,
							Math.min(size.max, e.clientX),
						),
					);
					break;
			}
		};

		window.addEventListener("pointermove", fn);
		return () => {
			window.removeEventListener("pointermove", fn);
		};
	}, [drag, size]);

	useEffect(() => {
		const fn = () => {
			setDrag(drag => {
				if (drag !== "none") {
					return "none";
				}
				return null;
			});
		};
		window.addEventListener("pointerup", fn);
		return () => {
			window.removeEventListener("pointerup", fn);
		};
	});

	// Draw on canvas
	const store = useStore();
	const commits = useObserver(() => store.profiler.commits.$);

	console.log(commits);

	useEffect(() => {
		const canvas = ref.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;
	}, [commits]);

	return (
		<div
			class="minimap"
			onPointerDown={e => {
				if (e.target instanceof HTMLElement) {
					if (e.target.classList.contains("minimap-marker-handle-left")) {
						setDrag("marker-left");
					} else if (
						e.target.classList.contains("minimap-marker-handle-right")
					) {
						setDrag("marker-right");
					}
				}
			}}
		>
			<div class="minimap-marker minimap-marker-left" style={`left: ${left}px`}>
				<button class="minimap-marker-handle minimap-marker-handle-left" />
			</div>
			<div
				class="minimap-marker minimap-marker-right"
				style={`left: ${right}px`}
			>
				<button class="minimap-marker-handle minimap-marker-handle-right" />
			</div>
			<canvas class="minimap-canvas" ref={ref} />
		</div>
	);
}
