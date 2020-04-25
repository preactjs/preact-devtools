import { Renderer } from "../renderer";
import { render, h } from "preact";
import { getNearestElement, measureNode, mergeMeasure } from "../dom";
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

			// eslint-disable-next-line prefer-const
			let [first, last] = dom;
			if (first === null) return;

			if (first.nodeType === Node.TEXT_NODE) {
				first = first.parentNode as any;
			}

			const node = getNearestElement(first!);
			const nodeEnd = last ? getNearestElement(last) : null;
			if (node != null) {
				const label = renderer.getDisplayNameById
					? renderer.getDisplayNameById(id)
					: renderer.getDisplayName(vnode);

				let size = measureNode(node);
				if (nodeEnd !== null) {
					const sizeLast = measureNode(nodeEnd);
					size = mergeMeasure(size, sizeLast);
				}

				render(
					h(Highlighter, {
						label,
						...size,
					}),
					highlightRef,
				);
			}
		}
	}

	return { highlight, destroy: destroyHighlight };
}
