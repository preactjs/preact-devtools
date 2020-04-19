/* eslint-disable no-mixed-spaces-and-tabs */
import { Component, VNode } from "preact";
import { RendererConfig10 } from "./renderer";
import { HookType } from "../../constants";

// Mangle accessors

/**
 * Get the direct parent of a `vnode`
 */
export function getVNodeParent(vnode: VNode) {
	return (
		(vnode as any)._parent ||
		(vnode as any).__ ||
		// Older Preact X versions used `__p`
		(vnode as any).__p ||
		null
	);
}

/**
 * Check if a `vnode` is the root of a tree
 */
export function isRoot(vnode: VNode, config: RendererConfig10) {
	return getVNodeParent(vnode) == null && vnode.type === config.Fragment;
}

/**
 * Return the component instance of a `vnode`
 */
export function getComponent(vnode: VNode | any): Component | null {
	return (vnode as any)._component || (vnode as any).__c || null;
}

/**
 * Get a `vnode`'s _dom reference.
 */
export function getDom(vnode: VNode) {
	return (vnode as any)._dom || (vnode as any).__e || null;
}

export function hasDom(x: any) {
	return x != null && ("_dom" in x || "__e" in x);
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

export function getStatefulHooks(c: Component) {
	const hooks = getComponentHooks(c);
	return hooks !== null
		? hooks._list ||
		  hooks.__ ||
		  hooks.i || // Preact 10.1.0
				null
		: null;
}

export function isUseReducerOrState(hookState: any) {
	return !!hookState._component || !!hookState.__c;
}

export function getStatefulHookValue(hookState: any) {
	if (hookState !== null) {
		const value = hookState._value || hookState.__ || null;
		if (value !== null && Array.isArray(value)) {
			return value[0];
		}
	}

	return null;
}

export function getHookState(c: Component, index: number, type?: HookType) {
	const list = getStatefulHooks(c);
	if (list && list[index]) {
		// useContext
		if (type === HookType.useContext) {
			const context = list[index]._context || list[index].__c;
			const provider = c.context[context._id] || c.context[context.__c];
			return provider
				? provider.props.value
				: context._defaultValue || context.__;
		}
		const value = list[index]._value || list[index].__;

		if (type === HookType.useRef) {
			return value.current;
		} else if (type === HookType.useErrorBoundary && !value) {
			return "__preact_empty__";
		}

		return value;
	}

	return [];
}

/**
 * Get teh diffed children of a `vnode`
 */
export function getActualChildren(
	vnode: VNode,
): Array<VNode | null | undefined> {
	return (vnode as any)._children || (vnode as any).__k || [];
}

// End Mangle accessors

/**
 * Get the root of a `vnode`
 */
export function findRoot(vnode: VNode, config: RendererConfig10): VNode {
	let next: VNode | null = vnode;
	while ((next = getVNodeParent(next)) != null) {
		if (isRoot(next, config)) {
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
export function getDisplayName(vnode: VNode, config: RendererConfig10) {
	const { type } = vnode;
	if (type === config.Fragment) return "Fragment";
	else if (typeof type === "function") {
		// Context is a special case :((
		// See: https://reactjs.org/docs/context.html#contextdisplayname
		const c = getComponent(vnode)!;
		if (c !== null) {
			// Consumer
			if (c.constructor) {
				const ct = (c.constructor as any).contextType;
				if (ct && ct.Consumer === type && ct.displayName) {
					return `${ct.displayName}.Consumer`;
				}
			}

			// Provider
			if ((c as any).sub) {
				const ctx = (type as any)._contextRef || (type as any).__;
				if (ctx && ctx.displayName) {
					return `${ctx.displayName}.Provider`;
				}
			}
		}

		return type.displayName || type.name || "Anonymous";
	} else if (typeof type === "string") return type;
	return "#text";
}

export function getEndTime(vnode: VNode) {
	return vnode.endTime || 0;
}

export function getStartTime(vnode: VNode) {
	return vnode.startTime || 0;
}

export function getNextState(c: Component) {
	return (c as any)._nextState || (c as any).__s || null;
}

export function setNextState(c: Component, value: any) {
	return ((c as any)._nextState = (c as any).__s = value);
}
