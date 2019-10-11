import { Renderer } from "./10/renderer";
import { createBridge } from "./bridge";
import { ObjPath } from "../view/components/ElementProps";
import { RawFilterState } from "./10/filter";
import { ID } from "../view/store/types";

export type EmitterFn = (event: string, data: any) => void;

export interface DevtoolEvents {
	"update-prop": { id: ID; path: ObjPath; value: any };
	"rename-prop": { id: ID; path: ObjPath; value: string };
	"update-state": { id: ID; path: ObjPath; value: any };
	"rename-state": { id: ID; path: ObjPath; value: string };
	"update-context": { id: ID; path: ObjPath; value: any };
	"rename-context": { id: ID; path: ObjPath; value: string };
	"force-update": ID;
	"start-picker": null;
	"stop-picker": null;
	"update-filter": RawFilterState;
	highlight: ID | null;
	log: ID;
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

	return {
		renderers,
		get connected() {
			return _connected;
		},
		set connected(value) {
			_connected = value;
		},
		emit(name, data) {
			bridge.send(name, data);
		},
		attach: renderer => {
			renderers.set(++uid, renderer);
			// Content Script is likely not ready at this point, so don't
			// flush any events here and politely request it to initialize
			bridge.send("attach", uid);
			return uid;
		},
		detach: id => renderers.delete(id),
	};
}
