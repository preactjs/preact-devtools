import {
	getComponent,
	getComponentHooks,
	getDisplayName,
	getHookState,
} from "../vnode";
import { jsonify, cleanContext, cleanProps, setIn, hasIn } from "../utils";
import { serializeVNode, RendererConfig10, getDevtoolsType } from "../renderer";
import { ID } from "../../../view/store/types";
import { IdMappingState, getVNodeById } from "../IdMapper";
import { VNode, Component, Options } from "preact";
import { parseStackTrace, StackFrame } from "errorstacks";
import { HookType } from "../../../constants";
import { debug } from "../../../debug";

function serialize(config: RendererConfig10, data: object | null) {
	return jsonify(data, node => serializeVNode(node, config), new Set());
}

/**
 * Throwaway component to render hooks
 */
// eslint-disable-next-line @typescript-eslint/no-empty-function
function Dummy() {}
Dummy.prototype = Component.prototype;

export interface HookData {
	type: HookType;
	stack: StackFrame[];
}

let hookLog: HookData[] = [];
let inspectingHooks = false;
let ancestorName = "unknown";

export function addHookStack(type: HookType) {
	if (!inspectingHooks) return;
	const err = new Error();
	let stack = err.stack ? parseStackTrace(err.stack) : [];
	const ancestorIdx = stack.findIndex(x => x.name === ancestorName);

	if (ancestorIdx > -1 && stack.length > 0) {
		// Remove `addHookStack` + `options._hook` + `getHookState` from stack
		let trim = 3;
		// These hooks are implemented with other hooks
		if (
			type === HookType.useState ||
			type === HookType.useImperativeHandle ||
			type === HookType.useCallback
		) {
			trim += 1;
		}
		stack = stack.slice(trim, ancestorIdx - 1);
	}

	hookLog.push({ type, stack });
}

function parseHookData(
	config: RendererConfig10,
	data: HookData[],
	component: Component,
): Record<string, any> {
	const out: Record<string, any> = {};

	data.forEach((hook, hookIdx) => {
		const itemPath = [];
		for (let i = hook.stack.length - 1; i >= 0; i--) {
			const frame = hook.stack[i];
			const isNative = i === 0;
			const name = isNative ? HookType[hook.type] : frame.name;
			itemPath.push(name);

			if (!hasIn(parent, itemPath)) {
				let value = null;
				if (isNative) {
					const s = getHookState(component, hookIdx);
					value = {
						name: "__meta__",
						meta: {
							index: hookIdx,
							type: hook.type,
						},
						value: serialize(config, s[0]),
					};
				}

				setIn(out, itemPath, value);
			}
		}
	});

	return out;
}

export function inspectHooks(
	config: RendererConfig10,
	options: Options,
	vnode: VNode,
) {
	inspectingHooks = true;
	hookLog = [];
	// TODO: Temporarily disable any console logs
	ancestorName = parseStackTrace(new Error().stack!)[0].name;

	const c = getComponent(vnode)!;
	const isClass =
		(vnode.type as any).prototype && (vnode.type as any).prototype.render;

	// Disable hook effects
	(options as any)._skipHooks = (options as any).__s = true;
	try {
		// Call render on a dummy component, so that any possible
		// state changes or effect are not written to our original
		// component.
		const dummy = {
			props: c.props,
			context: c.context,
			state: {},
		};
		if (isClass) {
			c.render.call(dummy, dummy.props, dummy.state);
		} else {
			c.constructor(dummy.props, dummy.context);
		}
	} catch (e) {
		// We don't care about any errors here. We only need
		// the hook call sites
		debug(e);
	} finally {
		(options as any)._skipHooks = (options as any).__s = false;
	}

	const parsed = hookLog.length ? parseHookData(config, hookLog, c) : null;

	console.log("HOOKS", parsed);
	inspectingHooks = false;
	ancestorName = "unknown";
	hookLog = [];

	return parsed;
}

export interface HookItem {
	name: string;
	type: HookType;
	index: number;
	value: any;
	children: HookItem[];
}

const nativeName = /^\d+__\S+$/;
export function getHookFromPath(objPath: any) {
	for (let i = objPath.length - 1; i >= 0; i--) {
		if (nativeName.test("" + objPath[i])) {
			return objPath.slice(0, i);
		}
	}

	return objPath;
}

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
) {
	const vnode = getVNodeById(ids, id);
	if (!vnode) return null;

	const c = getComponent(vnode);
	const hasState =
		typeof vnode.type === "function" &&
		c != null &&
		Object.keys(c.state).length > 0;

	const hasHooks = c != null && getComponentHooks(c) != null;
	const hooks = hasHooks ? inspectHooks(config, options, vnode) : null;
	const context = c != null ? serialize(config, cleanContext(c.context)) : null;
	const props =
		vnode.type !== null ? serialize(config, cleanProps(vnode.props)) : null;
	const state = hasState ? serialize(config, c!.state) : null;

	return {
		context,
		hooks,
		id,
		name: getDisplayName(vnode, config),
		props,
		state,
		// TODO: We're not using this information anywhere yet
		type: getDevtoolsType(vnode),
	};
}
