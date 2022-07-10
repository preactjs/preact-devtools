export function css(arr: TemplateStringsArray) {
	const sheet = new CSSStyleSheet();
	// Typings are too old
	(sheet as any).replaceSync(arr[0]);
	return sheet;
}

export function attachCss(el: HTMLElement, sheet: CSSStyleSheet) {
	const shadow = el.attachShadow({ mode: "open" });
	(shadow as any).adoptedStyleSheets = [sheet];
}
