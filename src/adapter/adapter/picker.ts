import { Renderer } from "../renderer";

export function createPicker(
	window: Window,
	renderer: Renderer,
	highlight: (id: number) => void,
	onStop: () => void,
) {
	let picking = false;

	function clicker(e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		stop();
	}

	function listener(e: WindowEventMap["mouseover"]) {
		e.preventDefault();
		e.stopPropagation();
		if (picking && e.target != null) {
			const id = renderer.findVNodeIdForDom(e.target as any);
			if (id > -1) highlight(id);
		}
	}

	function onMouseEvent(e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
	}

	function start() {
		if (!picking) {
			picking = true;
			window.addEventListener("mousedown", onMouseEvent, true);
			window.addEventListener("mouseover", listener, true);
			window.addEventListener("mouseup", onMouseEvent, true);
			window.addEventListener("click", clicker, true);
		}
	}

	function stop() {
		if (picking) {
			picking = false;
			onStop();

			window.removeEventListener("mousedown", onMouseEvent, true);
			window.removeEventListener("mouseover", listener, true);
			window.removeEventListener("mouseup", onMouseEvent, true);
			window.removeEventListener("click", clicker, true);
		}
	}

	return { start, stop };
}
