import { Renderer } from "../10/renderer";
import { render, h } from "preact";
import { getDisplayName } from "../10/vnode";
import { getNearestElement, measureNode } from "../dom";
import { ID } from "../../view/store/types";
import { Highlighter } from "../../view/components/Highlighter";

export function createHightlighter(renderer: Renderer) {
	/**
	 * Reference to the DOM element that we'll render the selection highlighter
	 * into. We'll cache it so that we don't unnecessarily re-create it when the
	 * hover state changes. We only destroy this elment once the user stops
	 * hovering a node in the tree.
	 */
	let highlightRef: HTMLDivElement | null = null;

	function destroyHighlight() {
		if (highlightRef) {
			document.body.removeChild(highlightRef!);
		}
		highlightRef = null;
	}

	function highlight(id: ID | null) {
		if (id !== null) {
			const vnode = renderer.getVNodeById(id);
			if (!vnode) return destroyHighlight();
			const dom = renderer.findDomForVNode(id);

			if (dom != null) {
				if (highlightRef == null) {
					highlightRef = document.createElement("div");
					highlightRef.id = "preact-devtools-highlighter";

					document.body.appendChild(highlightRef);
				}

				const node = getNearestElement(dom[0]!);

				if (node != null) {
					render(
						h(Highlighter, {
							label: getDisplayName(vnode),
							...measureNode(node),
						}),
						highlightRef,
					);
					return;
				}
			}
		}
		destroyHighlight();
	}

	return { highlight, destroy: destroyHighlight };
}
