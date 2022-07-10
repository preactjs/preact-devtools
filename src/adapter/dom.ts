import { NodeType } from "../constants";

export function getNearestElement(dom: Element | Text): Element {
	return dom.nodeType === NodeType.Text ? (dom.parentNode as any) : dom;
}

export function px2Int(input: string | null) {
	return input ? +input.replace(/px/, "") : 0;
}

/** Top, Right, Bottom, Left */
export type Dimensions = [number, number, number, number];
/** Top, Right, Bottom, Left */
export type Bounds = [boolean, boolean, boolean, boolean];

export interface Measurements {
	boxSizing: string;
	top: number;
	left: number;
	width: number;
	height: number;
	margin: Dimensions;
	border: Dimensions;
	padding: Dimensions;
	bounds: Bounds;
}

function getBoundsState(rect: {
	top: number;
	height: number;
	left: number;
	width: number;
}): Bounds {
	const top = rect.top + window.pageYOffset < window.scrollY;
	const bottom = rect.top + rect.height > window.innerHeight + scrollY;
	const left = rect.left + window.pageXOffset < window.scrollX;
	const right = rect.left + rect.width > window.scrollX + window.innerWidth;
	return [top, right, bottom, left];
}

export function measureNode(dom: Element): Measurements {
	const s = window.getComputedStyle(dom);
	const r = dom.getBoundingClientRect();

	const top = r.top + window.pageYOffset;
	const left = r.left + window.pageXOffset;

	return {
		top,
		left,
		bounds: getBoundsState(r),
		boxSizing: s.boxSizing,

		// Round to at most 2 decimals. This is not 100% accurate,
		// but good enough for our use case
		width: Math.round(r.width * 100) / 100,
		height: Math.round(r.height * 100) / 100,

		margin: [
			px2Int(s.marginTop),
			px2Int(s.marginRight),
			px2Int(s.marginBottom),
			px2Int(s.marginLeft),
		],
		border: [
			px2Int(s.borderTopWidth),
			px2Int(s.borderRightWidth),
			px2Int(s.borderBottomWidth),
			px2Int(s.borderLeftWidth),
		],
		padding: [
			px2Int(s.paddingTop),
			px2Int(s.paddingRight),
			px2Int(s.paddingBottom),
			px2Int(s.paddingLeft),
		],
	};
}

export function mergeMeasure(a: Measurements, b: Measurements): Measurements {
	const top = Math.min(a.top, b.top);
	const left = Math.min(a.left, b.left);
	const height = Math.max(a.top + a.height, b.top + b.height) - top;
	const width = Math.max(a.left + a.width, b.left + b.width) - left;
	return {
		boxSizing: a.boxSizing,
		top,
		left,
		bounds: getBoundsState({
			height,
			left,
			top,
			width,
		}),
		width,
		height,

		// Reset all margins for combined nodes. There is no
		// meaningful way to display them.
		margin: [0, 0, 0, 0],
		border: [0, 0, 0, 0],
		padding: [0, 0, 0, 0],
	};
}
