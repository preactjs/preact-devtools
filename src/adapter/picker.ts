import { Renderer } from "./10/renderer";

export function createPicker(
	window: Window,
	renderer: Renderer,
	highlight: (id: number) => void,
	onStop: () => void,
) {
	let picking = false;

	function clicker() {
		stop();
	}

	function listener(e: WindowEventMap["mouseover"]) {
		if (e.target != null) {
			const id = renderer.findVNodeIdForDom(e.target as any);
			if (id > -1) highlight(id);
		}
	}

	function start() {
		if (!picking) {
			picking = true;
			window.addEventListener("mouseover", listener);
			window.addEventListener("click", clicker);
		}
	}

	function stop() {
		if (picking) {
			picking = false;
			onStop();
			window.removeEventListener("mouseover", listener);
			window.removeEventListener("click", clicker);
		}
	}

	return { start, stop };
}
