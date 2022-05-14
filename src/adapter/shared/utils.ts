import { PreactBindings, SharedVNode } from "./bindings";

export function traverse<T extends SharedVNode>(
	vnode: T,
	fn: (vnode: T) => void,
	bindings: PreactBindings<T>,
) {
	fn(vnode);
	const children = bindings.getActualChildren(vnode);
	for (let i = 0; i < children.length; i++) {
		const child = children[i];
		if (child != null) {
			traverse(child, fn, bindings);
			fn(child);
		}
	}
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function deepClone<T extends object>(obj: T): T {
	return JSON.parse(JSON.stringify(obj));
}
