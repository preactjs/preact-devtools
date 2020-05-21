import { Renderer } from "./renderer";
import { ID } from "../view/store/types";
import { createAdapter, InspectData, UpdateType } from "./adapter/adapter";
import { RawFilterState } from "./adapter/filter";
import { Options } from "preact";
import { createRenderer, RendererConfig10 } from "./10/renderer";
import { setupOptions } from "./10/options";
import { createMultiRenderer } from "./MultiRenderer";
import parseSemverish from "./parse-semverish";
import { PortPageHook } from "./adapter/port";
import { PROFILE_RELOAD } from "../constants";

export type EmitterFn = (event: string, data: any) => void;

export interface ProfilerOptions {
	captureRenderReasons?: boolean;
}

export interface DevtoolEvents {
	"update-prop": { id: ID; path: string; value: any };
	"update-state": { id: ID; path: string; value: any };
	"update-context": { id: ID; path: string; value: any };
	"update-hook": { id: ID; value: any; meta: any };
	"force-update": ID;
	"start-picker": null;
	"stop-picker": null;
	"start-profiling": ProfilerOptions;
	"stop-profiling": null;
	"clear-profiling": null;
	"start-highlight-updates": null;
	"stop-highlight-updates": null;
	"reload-and-profile": ProfilerOptions;
	"update-filter": RawFilterState;
	"load-host-selection": null;
	"inspect-host-node": null;
	copy: string;
	highlight: ID | null;
	log: { id: ID; children: ID[] };
	inspect: ID;
	"select-node": ID;
	update: { id: ID; type: UpdateType; path: string; value: any };
	"inspect-result": InspectData;
	attach: { id: ID; supportsProfiling: boolean };
	initialized: null;
	init: null;
	refresh: null;
	disconnect: null;
}
export type EmitFn = <K extends keyof DevtoolEvents>(
	name: K,
	data: DevtoolEvents[K],
) => void;

export interface DevtoolsHook {
	/** Currently selected node in the native browser's Elements panel */
	$0: HTMLElement | null;
	connected: boolean;
	emit: EmitFn;
	listen: (fn: (name: string, cb: any) => any) => void;
	renderers: Map<number, Renderer>;
	attachPreact?(
		version: string,
		options: Options,
		config: RendererConfig10,
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

	const attachRenderer = (
		renderer: Renderer,
		supports: { renderReasons?: boolean; hooks?: boolean },
	) => {
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
			supportsRenderReasons: !!supports.renderReasons,
			supportsHooks: !!supports.hooks,
		});

		// Feature: Profile and reaload
		// Check if we should immediately start profiling on create
		const profilerOptions = window.localStorage.getItem(PROFILE_RELOAD);
		if (profilerOptions !== null) {
			window.localStorage.removeItem(PROFILE_RELOAD);
			renderer.startProfiling!(JSON.parse(profilerOptions));
		}

		return uid;
	};

	return {
		$0: null,
		renderers,
		get connected() {
			return status === "connected";
		},
		set connected(_) {
			// eslint-disable-next-line no-console
			console.warn("Mutating __PREACT_DEVTOOLS__.connected is deprecated.");
		},
		emit: port.send,
		listen: () => {
			// eslint-disable-next-line no-console
			console.error("__PREACT_DEVTOOLS__.listen() is deprecated.");
		},
		attachPreact: (version, options, config) => {
			if (status === "disconnected") {
				init();
			}

			// attach the correct renderer/options hooks based on the preact version
			const preactVersionMatch = parseSemverish(version);

			if (!preactVersionMatch) {
				// eslint-disable-next-line no-console
				console.error(
					`[PREACT DEVTOOLS] Could not parse preact version ${version}`,
				);
				return -1;
			}

			// currently we only support preact >= 10, later we can add another branch for major === 8
			if (preactVersionMatch.major == 10) {
				const supports = {
					renderReasons: !!config.Component,
					hooks: preactVersionMatch.minor >= 4 && preactVersionMatch.patch >= 1,
				};

				// Create an integer-based namespace to avoid clashing ids caused by
				// multiple connected renderers
				const namespace = Math.floor(Math.random() * 2 ** 32);
				const renderer = createRenderer(
					port,
					namespace,
					config as any,
					options,
					supports,
				);
				setupOptions(options, renderer, config as any);
				return attachRenderer(renderer, supports);
			}

			return -1;
		},
		attach: renderer => attachRenderer(renderer, { renderReasons: false }),
		detach: id => renderers.delete(id),
	};
}
