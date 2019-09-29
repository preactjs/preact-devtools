export function scrollIntoView(el: HTMLElement) {
	// Find closest scrollable parent
	let parent: HTMLElement | null = el;
	while ((parent = parent.parentNode as any)) {
		if (parent.scrollHeight > parent.clientHeight) {
			break;
		}
	}

	if (parent) {
		let rect = el.getBoundingClientRect();
		let top = rect.top;
		let visible =
			el.offsetTop >= parent.scrollTop &&
			rect.bottom <= parent.scrollTop + parent.clientHeight;
		if (!visible) {
			parent.scrollTo({
				top: el.offsetTop - rect.height,
				behavior: "smooth",
			});
		}
	}
}
