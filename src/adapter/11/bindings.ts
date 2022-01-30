import { RendererConfig } from "../shared/renderer";
import { ComponentHooks, HookState, PreactBindings } from "../shared/bindings";
import { HookType } from "../shared/hooks";

export interface Internal {
	type: any;
	key: any;
	flags: number;
	props: Record<string, any>;
	_parent: Internal | null; // FIXME: NO null?
	_component: Component;
	_children: Internal[];

	data: any;

	_dom: any;
	__e: any;

	_vnodeId: number;
	__v: number;
}

export interface Component {
	state: any;
}

// Internal.flags bitfield constants
const TYPE_TEXT = 1 << 0;
const TYPE_ELEMENT = 1 << 1;
const TYPE_CLASS = 1 << 2;
const TYPE_FUNCTION = 1 << 3;
/** Signals this internal has a _parentDom prop that should change the parent
 * DOM node of it's children */
const TYPE_ROOT = 1 << 4;
/** Any type of internal representing DOM */
const TYPE_DOM = TYPE_TEXT | TYPE_ELEMENT;
/** Any type of component */
const TYPE_COMPONENT = TYPE_CLASS | TYPE_FUNCTION | TYPE_ROOT;

export function isComponent(internal: Internal) {
	return (internal.flags & TYPE_COMPONENT) > 0;
}

export function isInternal(x: any): x is Internal {
	return x !== null && typeof x === "object" && typeof x.flags === "number";
}

export function isTextInternal(internal: Internal): boolean {
	return (internal.flags & TYPE_TEXT) > 0;
}

export function getComponentHooks(internal: Internal): ComponentHooks | null {
	const data = internal.data;
	return (data as any).__hooks || (data as any).__H || null;
}

export function isSuspenseVNode(internal: Internal): boolean {
	const c = getComponent(internal) as any;
	// FYI: Mangling of `_childDidSuspend` is not stable in Preact < 10.3.0
	return c != null && !!(c._childDidSuspend || c.__c);
}

export function getSuspenseStateKey(c: Component) {
	if ("_suspended" in c.state) {
		return "_suspended";
	} else if ("__e" in c.state) {
		return "__e";
	}

	// This is a bit whacky, but property name mangling is unsafe in
	// Preact <10.4.9
	const keys = Object.keys(c.state);
	if (keys.length > 0) {
		return keys[0];
	}

	return null;
}

// Mangle accessors

export function getDisplayName(internal: Internal, config: RendererConfig) {
	const { flags, type } = internal;

	if (flags & TYPE_COMPONENT) {
		if (type === config.Fragment) return "Fragment";
		// Context is a special case :((
		// See: https://reactjs.org/docs/context.html#contextdisplayname
		// Consumer
		const ct = (type as any).contextType;
		if (ct && ct.Consumer === type && ct.displayName) {
			return `${ct.displayName}.Consumer`;
		}

		// Provider
		const ctx = (type as any)._contextRef || (type as any).__;
		if (ctx && ctx.displayName) {
			return `${ctx.displayName}.Provider`;
		}

		if (isSuspenseVNode(internal)) {
			return "Suspense";
		}

		return type.displayName || type.name || "Anonymous";
	} else if (flags & TYPE_ELEMENT) {
		return internal.type;
	}
	return "#text";
}

export function getActualChildren(
	internal: Internal,
): Array<Internal | null | undefined> {
	return (internal as Internal)._children || (internal as any).__k || [];
}

export function getComponent(node: HookState | Internal): Component | null {
	return (node as HookState | Internal)._component || (node as any).__c || null;
}

export function isElement(node: Internal): boolean {
	return (node.flags & TYPE_ELEMENT) > 0;
}

export function getNextState<S>(c: Component): S {
	return (c as any)._nextState || (c as any).__s || null;
}

export function setNextState<S>(c: Component, value: S): S {
	return ((c as any)._nextState = (c as any).__s = value);
}

export function getDom(internal: Internal): HTMLElement | Text | null {
	return (internal as Internal)._dom || (internal as any).__e || null;
}

/**
 * Get the direct parent of a `vnode`
 */
export function getVNodeParent(internal: Internal): Internal | null {
	return (internal as Internal)._parent || (internal as any).__ || null;
}

/**
 * Check if a `vnode` is the root of a tree
 */
export function isRoot(internal: Internal, config: RendererConfig): boolean {
	return getVNodeParent(internal) == null && internal.type === config.Fragment;
}

export function getStatefulHooks(internal: Internal): HookState[] | null {
	const hooks = getComponentHooks(internal);
	return hooks !== null ? hooks._list || hooks.__ || null : null;
}

export function isUseReducerOrState(hookState: HookState): boolean {
	return !!hookState._component || !!hookState.__c;
}

export function getStatefulHookValue(hookState: HookState): unknown {
	if (hookState !== null) {
		const value = hookState._value || hookState.__ || null;
		if (value !== null && Array.isArray(value)) {
			return value[0];
		}
	}

	return null;
}

export function getHookState(
	internal: Internal,
	index: number,
	type?: HookType,
): unknown {
	const c = getComponent(internal);
	if (c === null) return [];
	const list = getStatefulHooks(internal);

	if (list && list[index]) {
		// useContext
		if (type === HookType.useContext) {
			const context = list[index]._context || list[index].__c || list[index].c;
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
 * Get the ancestor component that rendered the current vnode
 */
export function getAncestor(vnode: Internal): Internal | null {
	let next: Internal | null = vnode;
	while ((next = getVNodeParent(next)) != null) {
		return next;
	}

	return null;
}

export function createSuspenseState(vnode: Internal, suspended: boolean) {
	const c = getComponent(vnode) as Component;
	const key = getSuspenseStateKey(c);
	if (c && key) {
		return { [key]: suspended };
	}

	return {};
}

export function getSuspendedState(internal: Internal) {
	const c = getComponent(internal);
	if (c) {
		const key = getSuspenseStateKey(c);
		if (key) {
			return !!(c as any)._nextState[key];
		}
	}

	return null;
}

const getInstance = <T>(x: T): T => x;

export const bindingsV11: PreactBindings<Internal> = {
	isRoot,
	getDisplayName,
	getActualChildren,
	getAncestor,
	getDom,
	isTextVNode: isTextInternal,
	getInstance,
	createSuspenseState,
	getComponent,
	getComponentHooks,
	getHookState,
	getVNodeParent,
	isComponent,
	isElement,
	isSuspenseVNode,
	isVNode: isInternal,
	getSuspendedState,
	setNextState,
};
