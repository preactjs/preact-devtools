import { ID } from "../../view/store/types";
import { Internal } from "./shapes-v11";
import { getDisplayName } from "./utils-v11";

/**
 * Pretty print a `VNode` to the browser console. This can be triggered
 * by clicking a button in the devtools ui.
 */
export function logInternal(internal: Internal, id: ID, children: ID[]) {
	const display = getDisplayName(internal);
	const name = display === "#text" ? display : `<${display || "Component"} />`;

	/* eslint-disable no-console */
	console.group(`LOG %c${name}`, "color: #ea88fd; font-weight: normal");
	console.log("props:", internal.props);
	// FIXME
	// const c = getComponent(internal);
	// if (c != null) {
	// 	console.log("state:", c.state);
	// }
	console.log("internal:", internal);
	console.log("devtools id:", id);
	console.log("devtools children:", children);
	console.groupEnd();
	/* eslint-enable no-console */
}
