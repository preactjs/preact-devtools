import type { VNode } from "preact";
import {
	bindingsV10,
	getDisplayName as getDisplayNameV10,
} from "../10/bindings";
import type { RendererConfig } from "../shared/renderer";

export function isPortal(vnode: VNode): boolean {
	return (
		vnode.props != null &&
		typeof vnode.props === "object" &&
		("_parentDom" in vnode.props || "__P" in vnode.props)
	);
}

export function getDisplayName(vnode: VNode, config: RendererConfig): string {
	return isPortal(vnode) ? "Portal" : getDisplayNameV10(vnode, config);
}

export const bindingsV11 = {
	...bindingsV10,
	getDisplayName,
	getPropsVNodeDisplayName: getDisplayName,
	isPortal,
};
