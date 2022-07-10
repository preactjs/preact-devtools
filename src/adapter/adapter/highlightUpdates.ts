import { CanvasHighlight } from "../../view/components/CanvasHighlight/CanvasHighlight";

const DISPLAY_DURATION = 250;
const MAX_DISPLAY_DURATION = 3000;

export interface UpdateRect {
	x: number;
	y: number;
	width: number;
	height: number;
	count: number;
	expirationTime: number;
}

export type UpdateRects = Map<HTMLElement, UpdateRect>;

export function measureUpdate(updates: UpdateRects, dom: HTMLElement) {
	const data = updates.get(dom);
	const rect = dom.getBoundingClientRect();

	const now = performance.now();
	const expirationTime = data
		? Math.min(
				now + MAX_DISPLAY_DURATION,
				data.expirationTime + DISPLAY_DURATION,
		  )
		: now + DISPLAY_DURATION;

	updates.set(dom, {
		expirationTime,
		height: rect.height,
		width: rect.width,
		x: rect.x,
		y: rect.y,
		count: data ? data.count + 1 : 1,
	});
}

const tag = "preact-devtools-updates";
if (!customElements.get(tag)) {
	customElements.define(tag, CanvasHighlight);
}

const canvas = document.createElement(tag) as CanvasHighlight;

export function startDrawing(updateRects: UpdateRects) {
	if (!canvas.isConnected) {
		document.body.appendChild(canvas);
	}

	canvas.refresh();
	canvas.draw(updateRects);
}
