import { h } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { useStore } from "../../../../store/react-bindings";
import { useResize } from "../../../utils";
import {
	newMinimapState,
	renderTimeLegend,
	setupCanvas,
	worldToLocalPercent,
} from "./minimap-state";

export type DragTarget = "none" | "marker-left" | "marker-right" | "pane";

export function Minimap() {
	const store = useStore();
	const [state] = useState(() => newMinimapState());
	const left = state.left.value;
	const right = state.right.value;
	const ref = useRef<HTMLCanvasElement>(null);

	const start = 0;
	const end = 10000;

	console.log([start, end, end - start]);

	useResize(
		() => {
			if (!ref.current) return;
			const rect = ref.current.getBoundingClientRect();
			state.viewport.value = {
				left: rect.left,
				right: rect.right,
			};
		},
		[state],
		true,
	);

	useEffect(() => {
		const fn = (e: PointerEvent) => {
			const GAP = 2;
			switch (state.target.value) {
				case "marker-left":
					state.left.value = Math.min(
						worldToLocalPercent(state, e.clientX),
						state.right.value - GAP,
					);
					break;
				case "marker-right":
					state.right.value = Math.max(
						worldToLocalPercent(state, e.clientX),
						state.left.value + GAP,
					);
					break;
			}
		};

		window.addEventListener("pointermove", fn);
		return () => {
			window.removeEventListener("pointermove", fn);
		};
	}, [state]);

	useEffect(() => {
		const fn = () => {
			if (state.target.value !== "none") {
				state.target.value = "none";
			}
		};
		window.addEventListener("pointerup", fn);
		return () => {
			window.removeEventListener("pointerup", fn);
		};
	}, [state]);

	// Draw on canvas
	const commits = store.profiler.commits.value;

	// console.log(commits, state);

	useEffect(() => {
		const canvas = ref.current;
		if (!canvas) return;

		const ctx = setupCanvas(canvas);

		renderTimeLegend(ctx, 20, "100xx");
		renderTimeLegend(ctx, 80, "200xx");
		renderTimeLegend(ctx, 120, "500xx");
	}, [commits]);

	return (
		<div
			class="minimap"
			onPointerDown={e => {
				if (e.target instanceof HTMLElement) {
					if (e.target.classList.contains("minimap-marker-handle-left")) {
						state.target.value = "marker-left";
					} else if (
						e.target.classList.contains("minimap-marker-handle-right")
					) {
						state.target.value = "marker-right";
					}
				}
			}}
		>
			<div class="minimap-marker minimap-marker-left" style={`left: ${left}%`}>
				<button class="minimap-marker-handle minimap-marker-handle-left" />
			</div>
			<div
				class="minimap-marker minimap-marker-right"
				style={`left: ${right}%`}
			>
				<button class="minimap-marker-handle minimap-marker-handle-right" />
			</div>
			<canvas class="minimap-canvas" ref={ref} />
		</div>
	);
}
