export function getNearestElement(dom: Element | Text): Element {
	return dom instanceof Text ? (dom.parentNode as any) : dom;
}

export function px2Int(input: string | null) {
	return input ? +input.replace(/px/, "") : 0;
}

export interface Measurements {
	top: number;
	left: number;
	width: number;
	height: number;
	marginTop: number;
	marginRight: number;
	marginBottom: number;
	marginLeft: number;
	borderTop: number;
	borderRight: number;
	borderBottom: number;
	borderLeft: number;
	paddingTop: number;
	paddingRight: number;
	paddingBottom: number;
	paddingLeft: number;
	bounds: {
		top?: boolean;
		left?: boolean;
		bottom?: boolean;
		right?: boolean;
	};
}

function getBoundsState(rect: {
	top: number;
	height: number;
	left: number;
	width: number;
}) {
	return {
		top: rect.top + window.pageYOffset < window.scrollY,
		bottom: rect.top + rect.height > window.innerHeight + scrollY,
		left: rect.left + window.pageXOffset < window.scrollX,
		right: rect.left + rect.width > window.scrollX + window.innerWidth,
	};
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

		// Round to at most 2 decimals. This is not 100% accurate,
		// but good enough for our use case
		width: Math.round(r.width * 100) / 100,
		height: Math.round(r.height * 100) / 100,

		marginTop: px2Int(s.marginTop),
		marginRight: px2Int(s.marginRight),
		marginBottom: px2Int(s.marginBottom),
		marginLeft: px2Int(s.marginLeft),
		borderTop: px2Int(s.borderTop),
		borderRight: px2Int(s.borderRightWidth),
		borderBottom: px2Int(s.borderBottomWidth),
		borderLeft: px2Int(s.borderLeftWidth),
		paddingTop: px2Int(s.paddingTop),
		paddingRight: px2Int(s.paddingRight),
		paddingBottom: px2Int(s.paddingBottom),
		paddingLeft: px2Int(s.paddingLeft),
	};
}

export function mergeMeasure(a: Measurements, b: Measurements): Measurements {
	const top = Math.min(a.top, b.top);
	const left = Math.min(a.left, b.left);
	const height = Math.max(a.top + a.height, b.top + b.height) - top;
	const width = Math.max(a.left + a.width, b.left + b.width) - left;
	return {
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

		// Reset all margines for combined nodes. There is no
		// meaningful way to display them.
		marginTop: 0,
		marginRight: 0,
		marginBottom: 0,
		marginLeft: 0,
		borderTop: 0,
		borderRight: 0,
		borderBottom: 0,
		borderLeft: 0,
		paddingTop: 0,
		paddingRight: 0,
		paddingBottom: 0,
		paddingLeft: 0,
	};
}
