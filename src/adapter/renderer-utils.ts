import { getDisplayName, getActualChildren } from "./10/vnode";
import { VNode } from "preact";

export function traverse(vnode: VNode, fn: (vnode: VNode) => void) {
	fn(vnode);
	const children = getActualChildren(vnode);
	for (let i = 0; i < children.length; i++) {
		if (children[i] != null) {
			fn(children[i]);
		}
	}
}

export function jsonify(data: any, isVNode: (x: any) => boolean): any {
	if (isVNode(data)) {
		return {
			type: "vnode",
			name: getDisplayName(data as any),
		};
	}
	if (Array.isArray(data)) {
		return data.map(x => jsonify(x, isVNode));
	}
	switch (typeof data) {
		case "string":
			return data.length > 300 ? data.slice(300) : data;
		case "function": {
			return {
				type: "function",
				name: data.displayName || data.name || "anonymous",
			};
		}
		case "object":
			if (data === null) return null;
			const out = { ...data };
			Object.keys(out).forEach(key => {
				out[key] = jsonify(out[key], isVNode);
			});
			return out;
		default:
			return data;
	}
}

export function cleanProps(props: any) {
	if (typeof props === "string" || !props) return null;
	const out = { ...props };
	if (!Object.keys(out).length) return null;
	return out;
}

let reg = /__cC\d+/;
export function cleanContext(context: Record<string, any>) {
	let res: Record<string, any> = {};
	for (let key in context) {
		if (reg.test(key)) continue;
		res[key] = context[key];
	}

	if (Object.keys(res).length == 0) return null;
	return res;
}
