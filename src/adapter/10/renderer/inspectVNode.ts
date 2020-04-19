import { getComponent, getComponentHooks, getDisplayName } from "../vnode";
import { serialize, cleanContext, cleanProps } from "../utils";
import { RendererConfig10, getDevtoolsType } from "../renderer";
import { ID } from "../../../view/store/types";
import { IdMappingState, getVNodeById } from "../IdMapper";
import { Options } from "preact";
import { inspectHooks } from "./hooks";

/**
 * Serialize all properties/attributes of a `VNode` like `props`, `context`,
 * `hooks`, and other data. This data will be requested when the user selects a
 * `VNode` in the devtools. It returning information will be displayed in the
 * sidebar.
 */
export function inspectVNode(
	ids: IdMappingState,
	config: RendererConfig10,
	options: Options,
	id: ID,
	supportsHooks: boolean,
) {
	const vnode = getVNodeById(ids, id);
	if (!vnode) return null;

	const c = getComponent(vnode);
	const hasState =
		typeof vnode.type === "function" &&
		c != null &&
		Object.keys(c.state).length > 0;

	const hasHooks = c != null && getComponentHooks(c) != null;
	const hooks =
		supportsHooks && hasHooks ? inspectHooks(config, options, vnode) : null;
	const context = c != null ? serialize(config, cleanContext(c.context)) : null;
	const props =
		vnode.type !== null ? serialize(config, cleanProps(vnode.props)) : null;
	const state = hasState ? serialize(config, c!.state) : null;

	return {
		context,
		hooks: supportsHooks ? hooks : !supportsHooks && hasHooks ? [] : null,
		id,
		name: getDisplayName(vnode, config),
		props,
		state,
		// TODO: We're not using this information anywhere yet
		type: getDevtoolsType(vnode),
	};
}
