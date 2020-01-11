import { Renderer } from "./renderer";
import { Bridge } from "./bridge";
import { ObjPath } from "../view/components/sidebar/ElementProps";
import { ID } from "../view/store/types";
import { createAdapter, Adapter } from "./adapter/adapter";
import { RawFilterState, parseFilters } from "./adapter/filter";
import { Options, Fragment } from "preact";
import { createRenderer } from "./10/renderer";
import { setupOptions } from "./10/options";
import { createMultiRenderer } from "./MultiRenderer";
import parseSemverish from "./parse-semverish";

export type EmitterFn = (event: string, data: any) => void;

export interface DevtoolEvents {
	"update-prop": { id: ID; path: ObjPath; value: any };
	"update-state": { id: ID; path: ObjPath; value: any };
	"update-context": { id: ID; path: ObjPath; value: any };
	"force-update": ID;
	"start-picker": null;
	"stop-picker": null;
	"start-profiling": null;
	"stop-profiling": null;
	"clear-profiling": null;
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
	attachPreact?(
		version: string,
		options: Options,
		config: { Fragment: typeof Fragment },
	): number;
	attach(renderer: Renderer): number;
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
	let adapter: null | Adapter = null;

	const listeners: Array<EmitterFn | null> = [];

	const emit: EmitterFn = (name, data) => {
		bridge.send(name, data);
		listeners.forEach(l => l != null && l(name, data));
	};

	// Lazily init the adapter when a renderer is attached
	const init = () => {
		const multi = createMultiRenderer(renderers);
		adapter = createAdapter(emit, multi);

		bridge.listen("highlight", adapter.highlight);
		bridge.listen("update-prop", ev => {
			adapter!.update(ev.id, "props", ev.path, ev.value);
		});
		bridge.listen("update-state", ev => {
			adapter!.update(ev.id, "state", ev.path, ev.value);
		});
		bridge.listen("update-context", ev => {
			adapter!.update(ev.id, "context", ev.path, ev.value);
		});
		bridge.listen("select", adapter.select);
		bridge.listen("copy", adapter.copy);
		bridge.listen("inspect", adapter.inspect);
		bridge.listen("log", adapter.log);
		bridge.listen("update", adapter.log);
		bridge.listen("start-picker", adapter.startPickElement);
		bridge.listen("stop-picker", adapter.stopPickElement);
		bridge.listen("initialized", multi.flushInitial);
		bridge.listen("update-filter", ev => {
			multi.applyFilters(parseFilters(ev));
		});
		bridge.listen("force-update", ev => multi.forceUpdate(ev));

		// Profiler
		bridge.listen("start-profiling", multi.startProfiling!);
		bridge.listen("stop-profiling", multi.stopProfiling!);
	};

	const attachRenderer = (renderer: Renderer) => {
		if (adapter == null) {
			init();
		}

		renderers.set(++uid, renderer);

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
		attachPreact: (version, options, config) => {
			if (adapter == null) {
				init();
			}
			const hookProxy = {
				get connected() {
					return _connected;
				},
				set connected(value) {
					_connected = value;
				},
				emit,
			};

			console.log(
				`[PREACT DEVTOOLS] Attach renderer, preact version: ${version}`,
			);

			// attach the correct renderer/options hooks based on the preact version
			const preactVersionMatch = parseSemverish(version);

			if (!preactVersionMatch) {
				console.error(
					`[PREACT DEVTOOLS] Could not parse preact version ${version}`,
				);
				return -1;
			}

			// currently we only support preact >= 10, later we can add another branch for major === 8
			if (preactVersionMatch.major == 10) {
				const renderer = createRenderer(hookProxy, config as any);
				setupOptions(options, renderer);
				return attachRenderer(renderer);
			}

			return -1;
		},
		attach: attachRenderer,
		detach: id => renderers.delete(id),
	};
}
