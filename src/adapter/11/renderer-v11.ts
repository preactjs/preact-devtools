import { DevNodeType, ID } from "../../view/store/types";
import { PortPageHook } from "../adapter/port";
import { createReconciler, ReconcilerHost } from "../reconciler";
import { Renderer } from "../renderer";
import { logInternal } from "./log-v11";
import { getFlags, getParent } from "./mangle-v11";
import { Internal, InternalFlags } from "./shapes-v11";
import { getDisplayName } from "./utils-v11";

export function createRendererV11(
	port: PortPageHook,
	namespace: number,
): Renderer {
	const internalToId = new WeakMap<Internal, ID>();
	const idToInternal = new Map<ID, Internal>();
	let nextId = namespace;

	const reconciler: ReconcilerHost<Internal> = {
		isRoot: internal => {
			return (
				!!(getFlags(internal) & InternalFlags.FRAGMENT_NODE) &&
				getParent(internal) === null
			);
		},
		getRenderReason(oldInternal, newInternal) {
			return null;
		},
		shouldForceReorder: () => false,
		inspect: id => null,
		getType(internal) {
			return DevNodeType.FunctionComponent;
		},
		log(id, children) {
			const internal = idToInternal.get(id);
			if (internal == null) {
				// eslint-disable-next-line no-console
				console.warn(`Could not find vnode with id ${id}`);
				return;
			}

			logInternal(internal, id, children);
		},
		onViewSource(id) {},
		recordStats(stats, internal) {},
		updateElementCache(internal) {},
		highlightUpdate() {},
		has(id) {
			return idToInternal.has(id);
		},
		createId(internal) {
			const id = ++nextId;
			internalToId.set(internal, id);
			idToInternal.set(id, internal);
			return id;
		},
		hasId(internal) {
			return internalToId.has(internal);
		},
		getId(internal) {
			return internalToId.get(internal) || -1;
		},
		getById(id) {
			return idToInternal.get(id) || null;
		},
		removeId(internal) {
			const id = internalToId.get(internal);
			internalToId.delete(internal);
			if (id && id > -1) {
				idToInternal.delete(id);
			}
		},
		updateId(id, internal) {
			internalToId.set(internal, id);
			idToInternal.set(id, internal);
		},

		getDisplayName,
		getChildren(internal) {
			return internal._children;
		},
		getAncestor(internal) {
			let next: Internal | null = internal;
			while ((next = getParent(internal)) != null) {
				return next;
			}

			return null;
		},
		getStartTime: internal => 0, // FIXME
		getEndTime: internal => 0, // FIXME,
		getKey: internal => internal.key || null,

		shouldFilter(internal, filters) {
			const flags = internal._flags;
			if (flags & InternalFlags.FRAGMENT_NODE && filters.type.has("fragment")) {
				return true;
			} else if (
				flags & InternalFlags.TEXT_NODE ||
				(flags & InternalFlags.ELEMENT_NODE && filters.type.has("dom"))
			) {
				return true;
			}
			if (filters.regex.length > 0) {
				const name = getDisplayName(internal);
				return filters.regex.some(r => {
					// Regexes with a global flag are stateful in JS :((
					r.lastIndex = 0;
					return r.test(name);
				});
			}

			return false;
		},
		findDomForVNode(id) {
			return [null, null];
		},
		findVNodeIdForDom(node) {
			return -1;
		},
	};

	return createReconciler(reconciler, port);
}
