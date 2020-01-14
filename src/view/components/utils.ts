import { useRef, useEffect } from "preact/hooks";

const OFFSET = 16;

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
		let top = parent.scrollTop;

		if (el.offsetTop <= parent.scrollTop) {
			top = el.offsetTop - OFFSET;
		} else if (
			el.offsetTop + rect.height >
			parent.scrollTop + parent.clientHeight
		) {
			top = el.offsetTop - parent.clientHeight + rect.height + OFFSET;
		} else {
			return;
		}
		parent.scrollTo({
			top,
		});
	}
}

export function cssToPx(raw: string) {
	if (raw.endsWith("rem")) {
		const rem = parseFloat(raw.slice(0, -3));
		return (
			rem * parseFloat(getComputedStyle(document.documentElement).fontSize)
		);
	} else if (raw.endsWith("px")) {
		return parseFloat(raw.slice(0, -2));
	}

	throw new Error(`Conversion of ${raw} is not supported yet`);
}

export function getRootDomNode(el: HTMLElement): HTMLElement {
	let item = el;
	while (item.parentNode != null) {
		item = item.parentNode as any;
	}

	return item;
}

export function useInstance<T>(fn: () => T) {
	const ref = useRef<T>(null as any);
	const value = ref.current || (ref.current = fn());

	useEffect(
		() => () => {
			const v = ref.current as any;
			if (v && typeof v.destroy === "function") {
				v.destroy();
			}
		},
		[],
	);

	return value;
}

export function useResize(fn: () => void, args: any[]) {
	useEffect(() => {
		window.addEventListener("resize", fn);
		return () => window.removeEventListener("resize", fn);
	}, args);
}
