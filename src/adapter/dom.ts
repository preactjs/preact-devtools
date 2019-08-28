export function getNearestElement(dom: Element | Text): Element {
	return dom instanceof Text ? (dom.parentNode as any) : dom;
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
}

export function measureNode(dom: Element): Measurements {
	const isBoxSizing =
		window.getComputedStyle(dom)["box-sizing" as any] === "box-sizing";
	const s = window.getComputedStyle(dom);
	const r = dom.getBoundingClientRect();

	return {
		top: r.top,
		left: r.left,

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

export function px2Int(input: string | null) {
	return input ? +input.replace(/px/, "") : 0;
}
