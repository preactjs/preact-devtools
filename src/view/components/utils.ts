import { useContext, useLayoutEffect } from "preact/hooks";
import { WindowCtx } from "../store/react-bindings";
import { throttle } from "../../shells/shared/utils";

export const CONTAINER_RESIZE_EVENT = "preact-devtools:container-resize";

export function useResize(fn: () => void, args: any[], init = false) {
	// If we're running inside the browser extension context
	// we pull the correct window reference from context. And
	// yes there are multiple `window` objects to keep track of.
	// If you subscribe to the wrong one, nothing will be
	// triggered. For testing scenarios we can fall back to
	// the global window object instead.
	const win = useContext(WindowCtx) || window;

	useLayoutEffect(() => {
		if (init) fn();

		const fn2 = throttle(fn, 60);
		win.addEventListener("resize", fn2);
		// Embedders whose container can change size without the window
		// resizing (e.g. a resizable in-page drawer) dispatch this instead.
		win.addEventListener(CONTAINER_RESIZE_EVENT, fn2);
		return () => {
			win.removeEventListener("resize", fn2);
			win.removeEventListener(CONTAINER_RESIZE_EVENT, fn2);
		};
	}, [...args, init]);
}
