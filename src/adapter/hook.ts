import { Renderer } from "./renderer";
import { createBridge } from "./bridge";
import { ObjPath } from "../view/components/sidebar/ElementProps";
import { ID } from "../view/store/types";
import { createAdapter } from "./adapter/adapter";
import { RawFilterState, parseFilters } from "./adapter/filter";

export type EmitterFn = (event: string, data: any) => void;

export interface DevtoolEvents {
	"update-prop": { id: ID; path: ObjPath; value: any };
	"update-state": { id: ID; path: ObjPath; value: any };
	"update-context": { id: ID; path: ObjPath; value: any };
	"force-update": ID;
	"start-picker": null;
	"stop-picker": null;
	"update-filter": RawFilterState;
	"show-updates": boolean;
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
	renderers: Map<number, Renderer>;
	attach(renderer: Renderer): number;
	detach(id: number): void;
}

/**
 * Create hook to which Preact will subscribe and listen to. The hook
 * is the entrypoint where everything begins.
 */
export function createHook(): DevtoolsHook {
	const bridge = createBridge(window);
	const renderers = new Map<number, Renderer>();
	let uid = 0;
	let _connected = false;

	const emit: EmitterFn = (name, data) => {
		bridge.send(name, data);
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
		attach: renderer => {
			renderers.set(++uid, renderer);
			const adapter = createAdapter(emit, renderer);
			bridge.listen("initialized", renderer.flushInitial);
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
			bridge.listen("update-filter", ev => {
				renderer.applyFilters(parseFilters(ev));
			});
			bridge.listen("force-update", ev => renderer.forceUpdate(ev));
			bridge.listen("select", adapter.select);
			bridge.listen("copy", adapter.copy);
			bridge.listen("inspect", adapter.inspect);
			bridge.listen("log", adapter.log);
			bridge.listen("update", adapter.log);
			bridge.listen("start-picker", adapter.startPickElement);
			bridge.listen("stop-picker", adapter.stopPickElement);
			bridge.listen("show-updates", adapter.showUpdates);

			// Content Script is likely not ready at this point, so don't
			// flush any events here and politely request it to initialize
			bridge.send("attach", uid);
			return uid;
		},
		detach: id => renderers.delete(id),
	};
}
