import { useEffect, useContext, useLayoutEffect } from "preact/hooks";
import { WindowCtx } from "../store/react-bindings";
import { throttle } from "../../shells/shared/utils";

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
		const rect = el.getBoundingClientRect();
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

export function useResize(fn: () => void, args: any[], init = false) {
	// If we're running inside the browser extension context
	// we pull the correct window reference from context. And
	// yes there are multiple `window` objects to keep track of.
	// If you subscribe to the wrong one, nothing will be
	// triggered. For testing scenarios we can fall back to
	// the global window object instead.
	const win = useContext(WindowCtx) || window;

	useEffect(() => {
		if (init) fn();
	}, []);

	useLayoutEffect(() => {
		const fn2 = throttle(fn, 60);
		win.addEventListener("resize", fn2);
		return () => {
			win.removeEventListener("resize", fn2);
		};
	}, args);
}
