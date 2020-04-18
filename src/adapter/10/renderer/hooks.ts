import { Component, Options, VNode } from "preact";
import { RendererConfig10 } from "../renderer";
import { serialize, isEditable } from "../utils";
import { getComponent, getHookState } from "../vnode";
import { debug } from "../../../debug";
import { parseStackTrace } from "errorstacks";
import { HookType } from "../../../constants";
import { PropData } from "../../../view/components/sidebar/inspect/parseProps";

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
}

export function parseHookData(
	config: RendererConfig10,
	data: HookData[],
	component: Component,
): PropData[] {
	const tree = new Map<string, PropData>();
	const root: PropData = {
		children: [],
		depth: 0,
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

			let id = `${parentId}.${frame.location}.${frame.name}`;

			if (!tree.has(id)) {
				let value = undefined;
				let editable = false;

				if (isNative) {
					const s = getHookState(component, hookIdx);
					const rawValue = Array.isArray(s) ? s[0] : s;
					value = serialize(config, rawValue);
					editable = isEditable(rawValue);
					id += `.${type}`;
				}

				const item: PropData = {
					children: [],
					depth: hook.stack.length - i - 1,
					editable,
					id,
					type: "undefined",
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
