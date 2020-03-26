import { getDisplayName, getComponent } from "../vnode";
import { ID } from "../../../view/store/types";
import { IdMappingState, getVNodeById } from "../IdMapper";
import { RendererConfig10 } from "../renderer";

/**
 * Pretty print a `VNode` to the browser console. This can be triggered
 * by clicking a button in the devtools ui.
 */
export function logVNode(
	ids: IdMappingState,
	config: RendererConfig10,
	id: ID,
	children: ID[],
) {
	const vnode = getVNodeById(ids, id);
	if (vnode == null) {
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
