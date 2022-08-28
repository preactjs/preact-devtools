import { RendererConfig, getDevtoolsType } from "./renderer";
import { Options } from "preact";
import { inspectHooks } from "./hooks";
import { getVNodeById, IdMappingState } from "./idMapper";
import { cleanContext, cleanProps, serialize } from "./serialize";
import { PreactBindings, SharedVNode } from "./bindings";
import { InspectData } from "../adapter/adapter";
import { ID } from "../../view/store/types";

/**
 * Serialize all properties/attributes of a `VNode` like `props`, `context`,
 * `hooks`, and other data. This data will be requested when the user selects a
 * `VNode` in the devtools. It returning information will be displayed in the
 * sidebar.
 */
export function inspectVNode<T extends SharedVNode>(
	ids: IdMappingState<T>,
	config: RendererConfig,
	bindings: PreactBindings<T>,
	options: Options,
	id: ID,
	supportsHooks: boolean,
	version: string,
): InspectData | null {
	const vnode = getVNodeById(ids, id);
	if (!vnode) return null;

	const c = bindings.getComponent(vnode);
	const hasState =
		bindings.isComponent(vnode) &&
		c != null &&
		typeof c.state === "object" &&
		c.state != null &&
		Object.keys(c.state).length > 0;

	const hasHooks = c != null && bindings.getComponentHooks(vnode) != null;
	const hooks =
		supportsHooks && hasHooks
			? inspectHooks(config, options, vnode, bindings)
			: null;
	const context =
		c != null ? serialize(config, bindings, cleanContext(c.context)) : null;
	const props =
		vnode.type !== null
			? serialize(config, bindings, cleanProps(vnode.props))
			: null;
	const state = hasState ? serialize(config, bindings, c!.state) : null;

	let suspended = false;
	let canSuspend = false;
	let item: T | null = vnode;
	while (item) {
		if (bindings.isSuspenseVNode(item)) {
			canSuspend = true;

			const res = bindings.getSuspendedState(item);
			if (res !== null) {
				suspended = res;
			}
			break;
		}

		item = bindings.getVNodeParent(item);
	}

	return {
		context,
		canSuspend,
		key: vnode.key || null,
		hooks: supportsHooks ? hooks : !supportsHooks && hasHooks ? [] : null,
		id,
		name: bindings.getDisplayName(vnode, config),
		props,
		state,
		// TODO: We're not using this information anywhere yet
		type: getDevtoolsType(vnode, bindings),
		suspended,
		version,
	};
}
