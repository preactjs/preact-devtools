import { ID } from "../../view/store/types";
import { render, h } from "preact";
import { CanvasHighlight } from "../../view/components/CanvasHighlight/CanvasHighlight";

export interface UpdateRect {
	x: number;
	y: number;
	width: number;
	height: number;
	weight: number;
}

export type UpdateRects = Map<ID, UpdateRect>;

export function createUpdateCanvas() {
	const div = document.createElement("div");
	div.id = "preact-devtools-highlight-updates";

	render(h(CanvasHighlight, null), div);
	return div;
}

export function destroyCanvas(container: HTMLDivElement | null) {
	if (container) {
		render(null, container);
		container.remove();
	}
}

export function measureUpdate(
	updates: UpdateRects,
	id: ID,
	dom: HTMLElement,
): UpdateRect {
	if (!updates.has(id)) {
		updates.set(id, {
			height: 0,
			width: 0,
			x: 0,
			y: 0,
			weight: 0,
		});
	}

	const data = updates.get(id)!;
	const rect = dom.getBoundingClientRect();

	data.height = rect.height;
	data.width = rect.width;
	data.x = rect.x;
	data.y = rect.y;
	data.weight += 1;

	return data;
}

export function draw(canvas: HTMLCanvasElement, updates: UpdateRects) {
	if (!canvas.getContext) return;

	const ctx = canvas.getContext("2d");
	if (!ctx) return;

	updates.forEach(v => {
		ctx.strokeStyle = "red";
		ctx.lineWidth = 2;
		ctx.strokeRect(v.x, v.y, v.width, v.height);
	});
}
