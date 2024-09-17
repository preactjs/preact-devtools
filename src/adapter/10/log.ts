import { getComponent, getDisplayName } from "./bindings.ts";
import { ID } from "../../view/store/types.ts";
import { getVNodeById, IdMappingState } from "../shared/idMapper.ts";
import { SharedVNode } from "../shared/bindings.ts";
import { RendererConfig } from "../shared/renderer.ts";

/**
 * Pretty print a `VNode` to the browser console. This can be triggered
 * by clicking a button in the devtools ui.
 */
export function logVNode<T extends SharedVNode>(
	ids: IdMappingState<T>,
	config: RendererConfig,
	id: ID,
	children: ID[],
) {
	const vnode = getVNodeById(ids, id);
	if (vnode == null) {
		// eslint-disable-next-line no-console
		console.warn(`Could not find vnode with id ${id}`);
		return;
	}
	const display = getDisplayName(vnode, config);
	const name = display === "#text" ? display : `<${display || "Component"} />`;

	/* eslint-disable no-console */
	console.group(`LOG %c${name}`, "color: #ea88fd; font-weight: normal");
	console.log("props:", vnode.props);
	const c = getComponent(vnode);
	if (c != null) {
		console.log("state:", c.state);
	}
	console.log("vnode:", vnode);
	console.log("devtools id:", id);
	console.log("devtools children:", children);
	console.groupEnd();
	/* eslint-enable no-console */
}
