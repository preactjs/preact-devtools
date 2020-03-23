import { Renderer } from "./renderer";
import { ObjPath } from "../view/components/sidebar/ElementProps";
import { ID } from "../view/store/types";
import {
	createAdapter,
	Adapter,
	InspectData,
	UpdateType,
} from "./adapter/adapter";
import { RawFilterState } from "./adapter/filter";
import { Options, Fragment } from "preact";
import { createRenderer } from "./10/renderer";
import { setupOptions } from "./10/options";
import { createMultiRenderer } from "./MultiRenderer";
import parseSemverish from "./parse-semverish";
import { PortPageHook } from "./adapter/port";

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
	"select-node": ID;
	update: { id: ID; type: UpdateType; path: ObjPath; value: any };
	"inspect-result": InspectData;
	attach: { id: ID; supportsProfiling: boolean };
	initialized: null;
	init: null;
}
export type EmitFn = <K extends keyof DevtoolEvents>(
	name: K,
	data: DevtoolEvents[K],
) => void;

export interface DevtoolsHook {
	connected: boolean;
	emit: EmitFn;
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
export function createHook(port: PortPageHook): DevtoolsHook {
	const { listen, send } = port;
	const renderers = new Map<number, Renderer>();
	let uid = 0;
	let status: "connected" | "pending" | "disconnected" = "disconnected";

	// Lazily init the adapter when a renderer is attached
	const init = () => {
		const multi = createMultiRenderer(renderers);
		createAdapter(port, multi);

		status = "pending";
		send("init", null);

		listen("initialized", () => {
			status = "connected";
			multi.flushInitial();
		});
	};

	const attachRenderer = (renderer: Renderer) => {
		if (status === "disconnected") {
			init();
		}

		renderers.set(++uid, renderer);

		// Content Script is likely not ready at this point, so don't
		// flush any events here and politely request it to initialize
		const supportsProfiling =
			typeof renderer.startProfiling === "function" &&
			typeof renderer.stopProfiling === "function";
		send("attach", {
			id: uid,
			supportsProfiling,
		});
		return uid;
	};

	return {
		renderers,
		get connected() {
			return status === "connected";
		},
		set connected(_) {
			console.warn("Mutating __PREACT_DEVTOOLS__.connected is deprecated.");
		},
		emit: port.send,
		listen: () => {
			console.error("__PREACT_DEVTOOLS__.listen() is deprecated.");
		},
		attachPreact: (version, options, config) => {
			if (status === "disconnected") {
				init();
			}

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
				const renderer = createRenderer(port, config as any);
				setupOptions(options, renderer);
				return attachRenderer(renderer);
			}

			return -1;
		},
		attach: attachRenderer,
		detach: id => renderers.delete(id),
	};
}
