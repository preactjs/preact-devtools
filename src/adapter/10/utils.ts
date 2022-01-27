import { getActualChildren } from "./vnode";
import { VNode } from "preact";
import { RendererConfig10, serializeVNode } from "./renderer";
import { jsonify } from "../shared/serialize";

export function traverse(vnode: VNode, fn: (vnode: VNode) => void) {
	fn(vnode);
	const children = getActualChildren(vnode);
	for (let i = 0; i < children.length; i++) {
		const child = children[i];
		if (child != null) {
			traverse(child, fn);
			fn(child);
		}
	}
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function serialize(config: RendererConfig10, data: object | null) {
	return jsonify(data, node => serializeVNode(node, config), new Set());
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function cleanProps<T extends object>(
	props: T,
): Exclude<T, "__source" | "__self"> | null {
	if (typeof props === "string" || !props) return null;
	const out: any = {};
	for (const key in props) {
		if (key === "__source" || key === "__self") continue;
		out[key] = props[key];
	}
	if (!Object.keys(out).length) return null;
	return out;
}

const reg = /__cC\d+/;
export function cleanContext(context: Record<string, any>) {
	const res: Record<string, any> = {};
	for (const key in context) {
		if (reg.test(key)) continue;
		res[key] = context[key];
	}

	if (Object.keys(res).length == 0) return null;
	return res;
}
