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
