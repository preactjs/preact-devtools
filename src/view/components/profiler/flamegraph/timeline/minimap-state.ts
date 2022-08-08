import { valoo } from "../../../../valoo";

export type DragTarget = "none" | "marker-left" | "marker-right" | "pane";

export function newMinimapState() {
	const left = valoo(0); // percent
	const right = valoo(100); // percent
	const viewport = valoo({
		left: 0,
		right: 1,
	});
	const target = valoo<DragTarget>("none");

	return { left, right, viewport, target };
}

export type MinimapState = ReturnType<typeof newMinimapState>;

export function worldToLocalPercent(state: MinimapState, x: number) {
	const { left, right } = state.viewport.$;
	const percent = Math.max(
		0,
		Math.min(100, (100 / (right - left)) * (x - left)),
	);

	return percent;
}

export interface TimelineState {
	markers: number[][];
}

export function getPixelsPerMs(
	windowWidth: number,
	totalTimeInMs: number,
): number {
	return Math.ceil(totalTimeInMs / windowWidth);
}

export function getMarkers(
	start: number,
	end: number,
	pixelsPerMs: number,
): number[] {
	return [];
}

export function setupCanvas(canvas: HTMLCanvasElement) {
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error(`Unable to get 2d canvas context`);

	const parent = canvas.parentNode;
	if (!parent) throw new Error(`Canvas element is not attached`);

	// Resize according to parent + account for High-DPI displays
	const { width, height } = (parent as HTMLElement).getBoundingClientRect();
	canvas.height = Math.floor(height * window.devicePixelRatio);
	canvas.width = Math.round(width * window.devicePixelRatio);
	canvas.style.height = `${height}px`;
	canvas.style.width = `${width}px`;

	ctx.save();
	ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.save();

	return ctx;
}

export function renderTimeLegend(
	ctx: CanvasRenderingContext2D,
	x: number,
	label: string,
) {
	ctx.beginPath();
	ctx.moveTo(0, 0);
	ctx.fillStyle = "white";
	ctx.font = "10px arial";

	ctx.fillText(label, x - ctx.measureText(label).width - 4, 10);
	ctx.stroke();

	ctx.beginPath();

	ctx.moveTo(x, 0);
	ctx.lineTo(x, ctx.canvas.height);
	ctx.strokeStyle = "gray";
	ctx.stroke();
}
