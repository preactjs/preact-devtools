/**
 * Get's the last DOM child by depth in the rendered tree list. Assumes
 * that all items have a numeric `data-depth` attribute.
 */
export function getLastDomChild(dom: HTMLElement) {
	const depth = dom.getAttribute("data-depth") || 0;
	let item: HTMLElement | null = dom;
	let last: HTMLElement | null = null;
	while (
		(item = item.nextSibling as any) &&
		+(item.getAttribute("data-depth") || 0) > +depth
	) {
		last = item;
	}
	return last;
}

export function scrollIntoView(el: Element) {
	// Find closest scrollable parent
	let parent: Element | null = el;
	while ((parent = parent.parentNode as any)) {
		if (parent.scrollHeight > parent.clientHeight) {
			break;
		}
	}

	if (parent) {
		let rect = el.getBoundingClientRect();
		let cRect = parent.getBoundingClientRect();
		let top = rect.top;
		let visible = top >= cRect.top && rect.bottom <= cRect.height;
		if (!visible) {
			parent.scrollTo({
				top: top - rect.height,
				behavior: "smooth",
			});
		}
	}
}
