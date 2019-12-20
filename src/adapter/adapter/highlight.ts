import { Renderer } from "../renderer";
import { render, h } from "preact";
import { getNearestElement, measureNode } from "../dom";
import { ID } from "../../view/store/types";
import { Highlighter, style } from "../../view/components/Highlighter";

/**
 * This module is responsible for displaying the transparent element overlay
 * inside the user's web page.
 */
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

	function highlight(id: ID) {
		const vnode = renderer.getVNodeById(id);
		if (!vnode) {
			return destroyHighlight();
		}
		const dom = renderer.findDomForVNode(id);

		if (dom != null) {
			if (highlightRef == null) {
				highlightRef = document.createElement("div");
				highlightRef.id = "preact-devtools-highlighter";
				highlightRef.className = style.outerContainer;

				document.body.appendChild(highlightRef);
			}

			const node = getNearestElement(dom[0]!);
			if (node != null) {
				const label = renderer.getDisplayNameById
					? renderer.getDisplayNameById(id)
					: renderer.getDisplayName(vnode);

				render(
					h(Highlighter, {
						label,
						...measureNode(node),
					}),
					highlightRef,
				);
			}
		}
	}

	return { highlight, destroy: destroyHighlight };
}
