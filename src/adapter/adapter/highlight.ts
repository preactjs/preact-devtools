import { Renderer } from "../renderer";
import { getNearestElement, measureNode, mergeMeasure } from "../dom";
import { ID } from "../../view/store/types";
import { Highlighter, style } from "../../view/components/Highlighter";

/**
 * This module is responsible for displaying the transparent element overlay
 * inside the user's web page.
 */
export function createHightlighter(
	getRendererByVnodeId: (id: ID) => Renderer | null,
) {
	/**
	 * Reference to the DOM element that we'll render the selection highlighter
	 * into. We'll cache it so that we don't unnecessarily re-create it when the
	 * hover state changes. We only destroy this elment once the user stops
	 * hovering a node in the tree.
	 */
	let highlightRef: HTMLDivElement | null = null;
	const highlighter = new Highlighter();

	function highlight(id: ID) {
		const renderer = getRendererByVnodeId(id);
		if (!renderer) {
			return highlighter.destroy();
		}

		const vnode = renderer.getVNodeById(id);
		if (!vnode) {
			return highlighter.destroy();
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

			const node = getNearestElement(first);
			const nodeEnd = last ? getNearestElement(last) : null;
			if (node != null) {
				let label = renderer.getDisplayName(vnode);

				// Account for HOCs
				const lastOpenIdx = label.lastIndexOf("(");
				const firstCloseIdx = label.indexOf(")");
				if (lastOpenIdx > -1 && lastOpenIdx < firstCloseIdx) {
					label = label.slice(lastOpenIdx + 1, firstCloseIdx) || "Anonymous";
				}

				let size = measureNode(node);
				if (nodeEnd !== null) {
					const sizeLast = measureNode(nodeEnd);
					size = mergeMeasure(size, sizeLast);
				}

				// If the current DOM is inside an iframe, the position data
				// is relative to the content inside the iframe. We need to
				// add the position of the iframe in the parent document to
				// display the highlight overlay at the correct place.
				if (document !== first?.ownerDocument) {
					let iframe;
					const iframes = Array.from(document.querySelectorAll("iframe"));
					for (let i = 0; i < iframes.length; i++) {
						const w = iframes[i].contentWindow;
						if (w && w.document === first?.ownerDocument) {
							iframe = iframes[i];
							break;
						}
					}

					if (iframe) {
						const sizeIframe = measureNode(iframe);
						size.top += sizeIframe.top;
						size.left += sizeIframe.left;
					}
				}

				let height = size.height;
				let width = size.width;
				if (size.boxSizing === "border-box") {
					height += size.margin[0] + size.margin[2];
					width += size.margin[1] + size.margin[3];
				}

				highlighter.render({
					label,
					...size,
					top: size.top - size.margin[0],
					left: size.left - size.margin[3],
					height,
					width,
				});
			}
		}
	}

	return { highlight, destroy: () => highlighter.destroy() };
}
