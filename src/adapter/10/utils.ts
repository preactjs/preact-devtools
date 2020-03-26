import { getActualChildren } from "./vnode";
import { VNode } from "preact";
import { ObjPath } from "../../view/components/sidebar/ElementProps";

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

export interface SerializedVNode {
	type: "vnode";
	name: string;
}

export function jsonify(
	data: any,
	getVNode: (x: any) => SerializedVNode | null,
	seen: Set<any>,
): any {
	// Break out of circular references
	if (seen.has(data)) {
		return "[[Circular]]";
	}

	if (data !== null && typeof data === "object") {
		seen.add(data);
	}

	const vnode = getVNode(data);
	if (vnode != null) return vnode;

	if (Array.isArray(data)) {
		return data.map(x => jsonify(x, getVNode, seen));
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
				out[key] = jsonify(out[key], getVNode, seen);
			});
			return out;
		default:
			return data;
	}
}

export function cleanProps<T extends object>(
	props: T,
): Exclude<T, "__source" | "__self"> | null {
	if (typeof props === "string" || !props) return null;
	let out: any = {};
	for (let key in props) {
		if (key === "__source" || key === "__self") continue;
		out[key] = props[key];
	}
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

/**
 * Deeply mutate a property by walking down an array of property keys
 */
export function setIn(obj: Record<string, any>, path: ObjPath, value: any) {
	let last = path.pop();
	let parent = path.reduce((acc, attr) => (acc ? acc[attr] : null), obj);
	if (parent && last) {
		parent[last] = value;
	}
}
