import { attachCss, css } from "../../../adapter/adapter/custom-element";
import {
	UpdateRect,
	UpdateRects,
} from "../../../adapter/adapter/highlightUpdates";
import { throttle } from "../../../shells/shared/utils";

const OUTLINE_COLOR = "#f0f0f0";
const COLORS = [
	"#37afa9",
	"#63b19e",
	"#80b393",
	"#97b488",
	"#abb67d",
	"#beb771",
	"#cfb965",
	"#dfba57",
	"#efbb49",
	"#febc38",
];

const sheet = css`
	:host {
		position: fixed;
		left: 0;
		top: 0;
		pointer-events: none;
		z-index: 10000000;
		/**
		 * Canvas renders rectangles in the wrong size if this rule is set.
		 * See: https://twitter.com/marvinhagemeist/status/1263506164144316416
		 */
		max-width: none !important;
	}
`;

export class CanvasHighlight extends HTMLElement {
	timer: any;
	canvas: HTMLCanvasElement | null = null;

	constructor() {
		super();
		attachCss(this, sheet);
	}

	connectedCallback() {
		this.shadowRoot!.innerHTML = "<canvas></canvas>";
		window.addEventListener("resize", this.onResize);

		this.canvas = this.shadowRoot!.firstChild as HTMLCanvasElement;

		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
	}

	disconnectedCallback() {
		window.removeEventListener("resize", this.onResize);
		clearTimeout(this.timer);
	}

	refresh() {
		if (!this.canvas) return;
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
	}

	onResize = throttle(() => this.refresh(), 60);

	drawRect(ctx: CanvasRenderingContext2D, data: UpdateRect) {
		const colorIndex = Math.min(COLORS.length - 1, data.count - 1);

		// Outline
		ctx.lineWidth = 1;
		ctx.strokeStyle = OUTLINE_COLOR;
		ctx.strokeRect(data.x - 1, data.y - 1, data.width + 2, data.height + 2);

		// Inset
		ctx.lineWidth = 1;
		ctx.strokeStyle = OUTLINE_COLOR;
		ctx.strokeRect(data.x + 1, data.y + 1, data.width - 2, data.height - 2);

		// Border
		ctx.strokeStyle = COLORS[colorIndex];
		ctx.lineWidth = 1;
		ctx.strokeRect(data.x, data.y, data.width, data.height);
	}

	draw(updates: UpdateRects) {
		if (this.timer) clearTimeout(this.timer);

		const canvas = this.canvas;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		console.log("draw");
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		const now = performance.now();
		let nextRedraw = Number.MAX_SAFE_INTEGER;
		updates.forEach((data, key) => {
			if (data.expirationTime < now) {
				updates.delete(key);
			} else {
				this.drawRect(ctx, data);
				nextRedraw = Math.min(nextRedraw, data.expirationTime);
			}
		});

		if (nextRedraw !== Number.MAX_SAFE_INTEGER) {
			this.timer = setTimeout(() => this.draw(updates), nextRedraw - now);
		} else {
			console.log("remove");
			// this.remove();
		}
	}
}
