import { DevtoolEvents, DevtoolsHook } from "../hook";
import { Renderer } from "../renderer";
import { copyToClipboard } from "../../shells/shared/utils";
import { createPicker } from "./picker";
import { ID } from "../../view/store/types";
import { createHightlighter } from "./highlight";
import { parseFilters } from "./filter";
import { PortPageHook } from "./port";
import { PropData } from "../../view/components/sidebar/inspect/parseProps";
import { PROFILE_RELOAD, STATS_RELOAD } from "../../constants";

export type Path = Array<string | number>;

export type UpdateType = "props" | "state" | "hooks" | "context";

export interface Adapter {
	highlight(id: ID | null): void;
	inspect(id: ID): void;
	startPickElement(): void;
	stopPickElement(): void;
	log(data: { id: ID; children: ID[] }): void;
	copy(value: string): void;
	update(id: ID, type: UpdateType, path: Path, value: any): void;
	select(id: ID): void;
}

export interface InspectData {
	id: ID;
	name: string;
	type: any;
	context: Record<string, any> | null;
	hooks: PropData[] | null;
	props: Record<string, any> | null;
	state: Record<string, any> | null;
}

export function createAdapter(port: PortPageHook, renderer: Renderer) {
	const { listen, send } = port;

	const highlight = createHightlighter(renderer);

	const inspect = (id: ID) => {
		if (renderer.has(id)) {
			const data = renderer.inspect(id);
			if (data) {
				send("inspect-result", data);
			}
		}
	};

	const picker = createPicker(
		window,
		renderer,
		id => {
			highlight.highlight(id);
			if (id > -1) {
				inspect(id);
				send("select-node", id);
			}
		},
		() => {
			send("stop-picker", null);
			highlight.destroy();
		},
	);

	listen("start-picker", () => picker.start());
	listen("stop-picker", () => picker.stop());

	listen("copy", value => {
		try {
			const data = JSON.stringify(value, null, 2);
			copyToClipboard(data);
		} catch (err) {
			// eslint-disable-next-line no-console
			console.log(err);
		}
	});

	listen("inspect", id => {
		if (id !== null && renderer.has(id)) {
			const res = renderer.findDomForVNode(id);
			if (res && res.length > 0) {
				(window as any).__PREACT_DEVTOOLS__.$0 = res[0];
			}
		}
		inspect(id);
	});

	listen("log", e => {
		if (renderer.has(e.id)) {
			renderer.log(e.id, e.children);
		}
	});

	listen("highlight", id => {
		if (id == null) highlight.destroy();
		else highlight.highlight(id);
	});

	listen("disconnect", () => {
		// The devtools disconnected, clear any stateful
		// ui elements we may be displaying.
		highlight.destroy();
	});

	const update = (data: DevtoolEvents["update"]) => {
		const { id, type, path, value } = data;
		renderer.update(id, type, path.split(".").slice(1), value);

		// Notify all frontends that something changed
		inspect(id);
	};

	listen("update-prop", data => update({ ...data, type: "props" }));
	listen("update-state", data => update({ ...data, type: "state" }));
	listen("update-context", data => update({ ...data, type: "context" }));
	listen("update-hook", data => {
		if (renderer.updateHook && data.meta) {
			renderer.updateHook(data.id, data.meta.index, data.value);
		}
	});

	listen("update-filter", data => {
		renderer.applyFilters(parseFilters(data));
	});

	listen("refresh", () => {
		if (renderer.refresh) {
			renderer.refresh();
		}
	});

	// Profiler
	listen("start-profiling", options => renderer.startProfiling!(options));
	listen("stop-profiling", () => renderer.stopProfiling!());
	listen("reload-and-profile", options => {
		window.localStorage.setItem(PROFILE_RELOAD, JSON.stringify(options));

		try {
			window.location.reload();
		} catch (err) {
			// eslint-disable-next-line no-console
			console.error("Preact Devtools was not able to reload the current page.");
			// eslint-disable-next-line no-console
			console.log(err);
		}
	});

	// Stats
	listen("start-stats-recording", renderer.startRecordStats!);
	listen("stop-stats-recording", renderer.stopRecordStats!);
	listen("reload-and-record-stats", () => {
		window.localStorage.setItem(STATS_RELOAD, "true");

		try {
			window.location.reload();
		} catch (err) {
			// eslint-disable-next-line no-console
			console.error("Preact Devtools was not able to reload the current page.");
			// eslint-disable-next-line no-console
			console.log(err);
		}
	});

	listen("start-highlight-updates", () => {
		if (renderer.startHighlightUpdates) {
			renderer.startHighlightUpdates();
		}
	});
	listen("stop-highlight-updates", () => {
		if (renderer.stopHighlightUpdates) {
			renderer.stopHighlightUpdates();
		}
	});

	listen("load-host-selection", () => {
		const hook: DevtoolsHook = (window as any).__PREACT_DEVTOOLS__;
		const selected = hook.$0;
		if (selected) {
			const id = renderer.findVNodeIdForDom(selected);
			if (id > -1) {
				send("select-node", id);
			}
		}
	});

	listen("view-source", id => {
		const vnode = renderer.getVNodeById(id);
		const hook: DevtoolsHook = (window as any).__PREACT_DEVTOOLS__;

		if (vnode && typeof vnode.type === "function") {
			const { type } = vnode;
			hook.$type =
				type && type.prototype && type.prototype.render
					? type.prototype.render
					: type;
		} else {
			hook.$type = null;
		}
	});
}
