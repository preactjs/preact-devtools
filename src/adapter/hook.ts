import { Renderer } from "./renderer";
import { createBridge, Bridge } from "./bridge";
import { ObjPath } from "../view/components/sidebar/ElementProps";
import { ID } from "../view/store/types";
import { createAdapter, Adapter } from "./adapter/adapter";
import { RawFilterState, parseFilters } from "./adapter/filter";
import { Options, Fragment } from "preact";
import { createRenderer } from "./10/renderer";
import { setupOptions } from "./10/options";

export type EmitterFn = (event: string, data: any) => void;

export interface DevtoolEvents {
	"update-prop": { id: ID; path: ObjPath; value: any };
	"update-state": { id: ID; path: ObjPath; value: any };
	"update-context": { id: ID; path: ObjPath; value: any };
	"force-update": ID;
	"start-picker": null;
	"stop-picker": null;
	"update-filter": RawFilterState;
	copy: string;
	highlight: ID | null;
	log: { id: ID; children: ID[] };
	inspect: ID;
}
export type EmitFn = <K extends keyof DevtoolEvents>(
	name: K,
	data: DevtoolEvents[K],
) => void;

export interface DevtoolsHook {
	connected: boolean;
	emit: EmitterFn;
	listen: (fn: (name: string, cb: any) => any) => void;
	renderers: Map<number, Renderer>;
	attach(
		version: string,
		options: Options,
		config: { Fragment: typeof Fragment },
	): number;
	attachRenderer(renderer: Renderer): number;
	detach(id: number): void;
}

/**
 * Create hook to which Preact will subscribe and listen to. The hook
 * is the entrypoint where everything begins.
 */
export function createHook(bridge: Bridge): DevtoolsHook {
	const renderers = new Map<number, Renderer>();
	let uid = 0;
	let _connected = false;

	const listeners: Array<EmitterFn | null> = [];

	const emit: EmitterFn = (name, data) => {
		bridge.send(name, data);
		listeners.forEach(l => l != null && l(name, data));
	};

	const attachAdapter = (adapter: Adapter) => {
		bridge.listen("highlight", adapter.highlight);
		bridge.listen("update-prop", ev => {
			adapter.update(ev.id, "props", ev.path, ev.value);
		});
		bridge.listen("update-state", ev => {
			adapter.update(ev.id, "state", ev.path, ev.value);
		});
		bridge.listen("update-context", ev => {
			adapter.update(ev.id, "context", ev.path, ev.value);
		});
		bridge.listen("select", adapter.select);
		bridge.listen("copy", adapter.copy);
		bridge.listen("inspect", adapter.inspect);
		bridge.listen("log", adapter.log);
		bridge.listen("update", adapter.log);
		bridge.listen("start-picker", adapter.startPickElement);
		bridge.listen("stop-picker", adapter.stopPickElement);
	};

	const attachRenderer = (renderer: Renderer) => {
		renderers.set(++uid, renderer);
		bridge.listen("initialized", renderer.flushInitial);
		bridge.listen("update-filter", ev => {
			renderer.applyFilters(parseFilters(ev));
		});
		bridge.listen("force-update", ev => renderer.forceUpdate(ev));

		// Content Script is likely not ready at this point, so don't
		// flush any events here and politely request it to initialize
		bridge.send("attach", uid);
		return uid;
	};

	return {
		renderers,
		get connected() {
			return _connected;
		},
		set connected(value) {
			_connected = value;
		},
		emit,
		listen: fn => {
			const idx = listeners.push(fn) - 1;
			return () => {
				listeners[idx] = null;
			};
		},
		attach: (version, options, config) => {
			const hookProxy = {
				get connected() {
					return _connected;
				},
				set connected(value) {
					_connected = value;
				},
				emit,
			};

			console.log("attach", version);
			// TODO: Find a more robust solution
			//   Maybe something based on semver ranges?
			switch (version) {
				default: {
					const renderer = createRenderer(hookProxy, config as any);
					setupOptions(options, renderer);
					const adapter = createAdapter(emit, renderer);
					attachAdapter(adapter);
					return attachRenderer(renderer);
				}
			}

			return -1;
		},
		attachRenderer,
		detach: id => renderers.delete(id),
	};
}
