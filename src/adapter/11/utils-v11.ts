import { Internal, InternalFlags } from "./shapes-v11";

export function getDisplayName(internal: Internal) {
	const { type } = internal;
	if (internal._flags & InternalFlags.FRAGMENT_NODE) return "Fragment";
	else if (typeof type === "function") {
		// Context is a special case :((
		// See: https://reactjs.org/docs/context.html#contextdisplayname
		const c = internal._component;
		if (c !== null) {
			// Consumer
			// if (c.constructor) {
			// 	const ct = (c.constructor as any).contextType;
			// 	if (ct && ct.Consumer === type && ct.displayName) {
			// 		return `${ct.displayName}.Consumer`;
			// 	}
			// }
			// // Provider
			// if ((c as any).sub) {
			// 	const ctx = (type as any)._contextRef || (type as any).__;
			// 	if (ctx && ctx.displayName) {
			// 		return `${ctx.displayName}.Provider`;
			// 	}
			// }
			// FIXME: No suspense in keyed currently
			// if (isSuspenseVNode(vnode)) {
			// 	return "Suspense";
			// }
		}

		return type.displayName || type.name || "Anonymous";
	} else if (typeof type === "string") return type;
	return "#text";
}
