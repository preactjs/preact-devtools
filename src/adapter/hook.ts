import { Renderer } from "./10/renderer";
import { createBridge } from "./bridge";
import { ObjPath } from "../view/components/sidebar/ElementProps";
import { RawFilterState } from "./10/filter";
import { ID } from "../view/store/types";
import { parseCommitMessage } from "./debug";

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
