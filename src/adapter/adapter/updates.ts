/** [x1, y1, x2, y2] */
type Rect = [number, number, number, number];

export interface UpdateData {
	count: number;
	timeSinceUpdate: number;
	rect: Rect;
}

export function createUpdatePainter() {
	let canvas: HTMLCanvasElement | null = null;

	const init = () => {
		if (canvas == null) {
			canvas = document.createElement("canvas");
			canvas.style.cssText = `
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      pointer-events: none;
      z-index: 9999999999
    `;

			const root = window.document.documentElement;
			root.insertBefore(canvas, root.firstChild);
		}
	};

	const destroy = () => {
		if (canvas != null) {
			const parent = canvas.parentNode;
			if (parent) {
				parent.removeChild(canvas);
			}
			canvas = null;
		}
	};

	return { start: init, stop: destroy };
}

const COLORS = [
	"red",
	"orange",
	"yellow",
	"blue",
	"green",
	"pink",
	"7",
	"8",
	"9",
	"10",
];

export function draw(canvas: HTMLCanvasElement, data: UpdateData[]) {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	const ctx = canvas.getContext("2d")!;
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	data.forEach(node => {
		const idx = Math.min(node.count, COLORS.length - 1);
		drawRect(ctx, node.rect, COLORS[idx]);
	});
}

export function drawRect(
	ctx: CanvasRenderingContext2D,
	rect: Rect,
	color: string,
) {
	ctx.lineWidth = 2;
	ctx.strokeStyle = color;
	ctx.strokeRect(rect[0], rect[1], rect[2] - rect[0], rect[3] - rect[1]);
}
