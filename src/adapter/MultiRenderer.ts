import { Renderer } from "./renderer";
import { ID } from "../view/store/types";

export function getRendererByVNodeId(renderers: Map<number, Renderer>, id: ID) {
	const arr = Array.from(renderers.values());
	for (let i = 0; i < arr.length; i++) {
		const renderer = arr[i];
		if (renderer.has(id)) {
			return renderer;
		}
	}

	return null;
}

/**
 * Combine many renderers into one.
 */
export function createMultiRenderer(
	renderers: Map<number, Renderer>,
): Renderer {
	return {
		has(id) {
			return getRendererByVNodeId(renderers, id) !== null;
		},
		getVNodeById(id) {
			const renderer = getRendererByVNodeId(renderers, id);
			if (renderer) {
				return renderer.getVNodeById(id);
			}

			return null;
		},
		inspect(id) {
			const renderer = getRendererByVNodeId(renderers, id);
			if (renderer) {
				return renderer.inspect(id);
			}
			return null;
		},
		update(id, type, path, value) {
			const renderer = getRendererByVNodeId(renderers, id);
			if (renderer) {
				renderer.update(id, type, path, value);
			}
		},
		onCommit() {
			throw new Error(
				"Trying to call onCommit on MultiRenderer. " +
					"Please call onCommit on the renderer instance directly.",
			);
		},
		onUnmount() {
			throw new Error(
				"Trying to call onUnmount on MultiRenderer. " +
					"Please call onUnmount on the renderer instance directly.",
			);
		},
		flushInitial() {
			renderers.forEach(r => r.flushInitial());
		},
		forceUpdate(id) {
			const renderer = getRendererByVNodeId(renderers, id);
			if (renderer) {
				renderer.forceUpdate(id);
			}
		},
		getDisplayName(vnode) {
			const arr = Array.from(renderers.values());
			for (let i = 0; i < arr.length; i++) {
				const renderer = arr[i];
				const name = renderer.getDisplayName(vnode);
				if (name !== "Unknown") {
					return name;
				}
			}
			return "Unknown";
		},
		getDisplayNameById(id) {
			const renderer = getRendererByVNodeId(renderers, id);
			if (renderer) {
				if (renderer.getDisplayNameById) {
					return renderer.getDisplayNameById(id);
				}

				const vnode = renderer.getVNodeById(id);
				if (vnode) {
					return renderer.getDisplayName(vnode);
				}
			}
			return "Unknown";
		},
		findVNodeIdForDom(node) {
			const arr = Array.from(renderers.values());
			for (let i = 0; i < arr.length; i++) {
				const renderer = arr[i];
				const id = renderer.findVNodeIdForDom(node);
				if (id !== -1) {
					return id;
				}
			}
			return -1;
		},
		findDomForVNode(id) {
			const renderer = getRendererByVNodeId(renderers, id);
			if (renderer) {
				return renderer.findDomForVNode(id);
			}
			return null;
		},
		log(id, children) {
			const renderer = getRendererByVNodeId(renderers, id);
			if (renderer) {
				renderer.log(id, children);
			}
		},
		applyFilters(nextFilters) {
			renderers.forEach(renderer => renderer.applyFilters(nextFilters));
		},
	};
}
