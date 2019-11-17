import { Fragment, Component, VNode } from "preact";

// Mangle accessors

/**
 * Get the direct parent of a `vnode`
 */
export function getVNodeParent(vnode: VNode) {
	return (vnode as any)._parent || (vnode as any).__ || null;
}

/**
 * Check if a `vnode` is the root of a tree
 */
export function isRoot(vnode: VNode) {
	// TODO: This may break with bundling due to a different
	// reference to `Fragment`
	return getVNodeParent(vnode) == null && vnode.type === Fragment;
}

/**
 * Return the component instance of a `vnode`
 */
export function getComponent(vnode: VNode): Component | null {
	return (vnode as any)._component || (vnode as any).__c || null;
}

/**
 * Get a `vnode`'s _dom reference.
 */
export function getDom(vnode: VNode) {
	return (vnode as any)._dom || (vnode as any).__e || null;
}

/**
 * Get the last dom child of a `vnode`
 */
export function getLastDomChild(vnode: VNode) {
	return (vnode as any)._lastDomChild || (vnode as any).__d || null;
}

/**
 * Check if a `vnode` represents a `Suspense` component
 */
export function isSuspenseVNode(vnode: VNode) {
	const c = getComponent(vnode) as any;
	// FIXME: Mangling of `_childDidSuspend` is not stable in Preact
	return c != null && c._childDidSuspend;
}

/**
 * Get the internal hooks state of a component
 */
export function getComponentHooks(c: Component) {
	return (c as any).__hooks || (c as any).__H || null;
}

/**
 * Get teh diffed children of a `vnode`
 */
export function getActualChildren(vnode: VNode): VNode[] {
	return (vnode as any)._children || (vnode as any).__k || [];
}

// End Mangle accessors

/**
 * Get the root of a `vnode`
 */
export function findRoot(vnode: VNode): VNode {
	let next: VNode | null = vnode;
	while ((next = getVNodeParent(next)) != null) {
		if (isRoot(next)) {
			return next;
		}
	}

	return vnode;
}

/**
 * Get the ancestor component that rendered the current vnode
 */
export function getAncestor(vnode: VNode) {
	let next: VNode | null = vnode;
	while ((next = getVNodeParent(next)) != null) {
		return next;
	}

	return null;
}

/**
 * Get human readable name of the component/dom element
 */
export function getDisplayName(vnode: VNode) {
	if (vnode.type === Fragment) return "Fragment";
	else if (typeof vnode.type === "function")
		return vnode.type.displayName || vnode.type.name;
	else if (typeof vnode.type === "string") return vnode.type;
	return "#text";
}
