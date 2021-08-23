import { h, Component, Options, VNode } from "preact";
import { RendererConfig10 } from "../renderer";
import { serialize, isEditable } from "../utils";
import { getComponent, getHookState, getComponentHooks } from "../vnode";
import { parseStackTrace } from "errorstacks";
import { HookType } from "../../../constants";
import {
	PropData,
	parseProps,
	PropDataType,
} from "../../../view/components/sidebar/inspect/parseProps";

/**
 * Throwaway component to render hooks
 */
// eslint-disable-next-line @typescript-eslint/no-empty-function
function Dummy() {}
Dummy.prototype = Component.prototype;

export interface HookLocation {
	name: string;
	location: string;
}

export interface HookData {
	type: HookType;
	stack: HookLocation[];
}

let hookLog: HookData[] = [];
let inspectingHooks = false;
let ancestorName = "unknown";
const debugValues = new Map<string, string>();
let debugNames: string[] = [];

export function addHookName(name: any) {
	if (!inspectingHooks) return;
	debugNames.push(String(name));
}

export function addDebugValue(value: any) {
	if (!inspectingHooks) return;

	const last = hookLog.pop()!;
	const location = last.stack
		.reverse()
		.slice(0, -1)
		.map(x => (x.name === "root" ? x.name : `${x.location}.${x.name}`))
		.join(".");

	debugValues.set(location, "" + value);
}

let ignoreNext = false;
export function addHookStack(type: HookType) {
	if (!inspectingHooks || ignoreNext) {
		ignoreNext = false;
		return;
	}

	// Ignore next useState call coming from useErrorBoundary
	if (type === HookType.useErrorBoundary) {
		ignoreNext = true;
	}

	// By default browser limit stack trace length to 10 entries
	const oldLimit = Error.stackTraceLimit;
	Error.stackTraceLimit = 1000;

	const err = new Error();
	let stack = err.stack ? parseStackTrace(err.stack) : [];
	const ancestorIdx = stack.findIndex(x => x.name === ancestorName);

	if (ancestorIdx > -1 && stack.length > 0) {
		// Remove `addHookStack` + `options._hook` + `getHookState` from stack
		let trim = type === HookType.useDebugValue ? 2 : 3;
		// These hooks are implemented with other hooks
		if (
			type === HookType.useState ||
			type === HookType.useImperativeHandle ||
			type === HookType.useCallback ||
			type === HookType.useRef
		) {
			trim += 1;
		}
		stack = stack.slice(trim, ancestorIdx);
	}

	const normalized: HookLocation[] = [];

	// To easy mappings we'll rotate all positional data.
	for (let i = 0; i < stack.length; i++) {
		if (i === stack.length - 1) {
			normalized.push({ name: "root", location: "root" });
			continue;
		}
		const frame = stack[i];
		const next = stack[i + 1];
		normalized.push({
			name: frame.name,
			location: `${next.fileName.replace(window.origin, "")}:${next.line}:${
				next.column
			}`,
		});
	}

	hookLog.push({ type, stack: normalized });

	// Restore original stack trace limit
	Error.stackTraceLimit = oldLimit;
}

export function parseHookData(
	config: RendererConfig10,
	data: HookData[],
	component: Component,
	userHookNames: string[],
): PropData[] {
	const tree = new Map<string, PropData>();
	const root: PropData = {
		children: [],
		depth: 0,
		name: "root",
		editable: false,
		id: "root",
		type: "object",
		value: null,
		meta: null,
	};
	tree.set("root", root);
	const out: PropData[] = [root];

	data.forEach((hook, hookIdx) => {
		const type = HookType[hook.type];
		let parentId = "root";

		for (let i = hook.stack.length - 2; i >= 0; i--) {
			const frame = hook.stack[i];
			const isNative = i === 0;

			const id = `${parentId}.${frame.location}.${frame.name}`;

			if (!tree.has(id)) {
				let value: any = "__preact_empty__";
				let editable = false;
				let children: string[] = [];
				let nodeType: PropDataType = "undefined";
				const depth = hook.stack.length - i - 1;
				let name = isNative ? type : frame.name;
				if (
					userHookNames.length > 0 &&
					(hook.type === HookType.useState ||
						hook.type === HookType.useRef ||
						hook.type === HookType.useMemo ||
						hook.type === HookType.useReducer)
				) {
					name = `${name} ${userHookNames.pop()!}`;
				}

				if (debugValues.has(id)) {
					value = debugValues.get(id);
				}

				let hookValueTree: PropData[] = [];

				if (isNative) {
					const s = getHookState(component, hookIdx, hook.type);
					const rawValue = Array.isArray(s) ? s[0] : s;
					value = serialize(config, rawValue);

					// The user should be able to click through the value
					// properties if the value is an object. We parse it
					// separately and append it as children to our hook node
					if (typeof rawValue === "object" && !(rawValue instanceof Element)) {
						const tree = parseProps(value, id, 7, 0, name);
						children = tree.get(id)!.children;
						hookValueTree = Array.from(tree.values());
						if (hookValueTree.length > 1) {
							hookValueTree = hookValueTree.slice(1);
						}
						nodeType = hookValueTree[0].type;

						hookValueTree.forEach(node => {
							node.id = id + node.id;
							node.editable = false;
							node.depth += depth;
						});
					}
					editable =
						(hook.type === HookType.useState ||
							hook.type === HookType.useReducer) &&
						isEditable(rawValue);
				}

				const item: PropData = {
					children,
					depth,
					editable,
					id,
					name,
					type: nodeType,
					meta: isNative
						? {
								index: hookIdx,
								type,
						  }
						: frame.name,
					value,
				};
				tree.set(id, item);
				out.push(item);

				if (tree.has(parentId)) {
					tree.get(parentId)!.children.push(id);
				}

				if (hookValueTree.length) {
					hookValueTree.forEach(v => {
						tree.set(v.id, v);
						out.push(v);
					});
				}
			}

			parentId = id;
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
	debugValues.clear();
	debugNames = [];
	ancestorName = parseStackTrace(new Error().stack!)[0].name;

	const c = getComponent(vnode)!;
	const isClass =
		(vnode.type as any).prototype && (vnode.type as any).prototype.render;

	// Disable hook effects
	(options as any)._skipEffects = (options as any).__s = true;

	const prevConsole: Record<string, any> = {};

	// Temporarily disable all console methods to not confuse users
	// It sucks that we need to do this :/
	for (const method in console) {
		try {
			prevConsole[method] = (console as any)[method];
			(console as any)[method] = () => undefined;
		} catch (error) {
			// Ignore errors here
		}
	}

	try {
		// Call render on a dummy component, so that any possible
		// state changes or effect are not written to our original
		// component.
		const hooks = getComponentHooks(c);
		const dummy = {
			props: c.props,
			context: c.context,
			state: {},
			__hooks: hooks,
			__H: hooks,
		};

		// Force preact to reset internal hooks index
		const renderHook = (options as any)._render || (options as any).__r;
		if (renderHook) {
			const vnode = h("div", null);
			// Note: A "div" normally won't have the _component property set,
			// but we can get away with that for the devtools
			(vnode as any)._component = dummy;
			(vnode as any).__c = dummy;
			renderHook(vnode);
		}

		if (isClass) {
			c.render.call(dummy, dummy.props, dummy.state);
		} else {
			c.constructor.call(dummy, dummy.props, dummy.context);
		}
	} catch (error) {
		// We don't care about any errors here. We only need
		// the hook call sites
	} finally {
		// Restore original console
		for (const method in prevConsole) {
			try {
				(console as any)[method] = prevConsole[method];
			} catch (error) {
				// Ignore errors
			}
		}
		(options as any)._skipEffects = (options as any).__s = false;
	}

	const parsed = hookLog.length
		? parseHookData(config, hookLog, c, [...debugNames].reverse())
		: null;

	debugNames = [];

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
