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
 * TODO: Deprecate this
 */
export function createMultiRenderer(
	renderers: Map<number, Renderer>,
): Renderer {
	return {
		refresh() {
			renderers.forEach(r => r.refresh && r.refresh());
		},
		clear() {
			renderers.forEach(r => r.clear && r.clear());
		},
		startProfiling(options) {
			renderers.forEach(r => r.startProfiling && r.startProfiling(options));
		},
		stopProfiling() {
			renderers.forEach(r => r.stopProfiling && r.stopProfiling());
		},
		startHighlightUpdates() {
			renderers.forEach(
				r => r.startHighlightUpdates && r.startHighlightUpdates(),
			);
		},
		stopHighlightUpdates() {
			renderers.forEach(
				r => r.stopHighlightUpdates && r.stopHighlightUpdates(),
			);
		},
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
		updateHook(id, index, value) {
			renderers.forEach(r => r.updateHook && r.updateHook(id, index, value));
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
