import { DevtoolsHook } from "../hook";
import { Renderer } from "../10/renderer";
import { setIn, copyToClipboard } from "../../shells/shared/utils";
import { getComponent } from "../10/vnode";
import { createPicker } from "./picker";
import { ID } from "../../view/store/types";
import { createHightlighter } from "./highlight";

export type Path = Array<string | number>;

export interface DevtoolsEvent {
	name: string;
	data: any;
}

export type UpdateType = "props" | "state" | "hooks" | "context";

export interface Adapter {
	highlight(id: ID | null): void;
	inspect(id: ID): void;
	startPickElement(): void;
	stopPickElement(): void;
	log(id: ID): void;
	copy(value: string): void;
	update(id: ID, type: UpdateType, path: Path, value: any): void;
	select(id: ID): void;
}

export interface InspectData {
	id: ID;
	name: string;
	type: any;
	context: Record<string, any> | null;
	canEditHooks: boolean;
	hooks: any | null;
	canEditProps: boolean;
	props: Record<string, any> | null;
	canEditState: boolean;
	state: Record<string, any> | null;
}

export function createAdapter(hook: DevtoolsHook, renderer: Renderer): Adapter {
	const highlight = createHightlighter(renderer);

	const picker = createPicker(
		window,
		renderer,
		id => {
			highlight.highlight(id);
			hook.emit("select-node", id);
		},
		() => {
			hook.emit("stop-picker", null);
			highlight.destroy();
		},
	);

	return {
		inspect(id) {
			if (renderer.has(id)) {
				const data = renderer.inspect(id);
				if (data !== null) {
					hook.emit("inspect-result", data);
				}
			}
		},
		log(id) {
			if (renderer.has(id)) renderer.log(id);
		},
		select(id) {
			// Unused
		},
		highlight: id => {
			if (id == null) highlight.destroy();
			else highlight.highlight(id);
		},
		update(id, type, path, value) {
			const vnode = renderer.getVNodeById(id);
			if (vnode !== null) {
				if (typeof vnode.type === "function") {
					const c = getComponent(vnode);
					if (c) {
						if (type === "props") {
							setIn((vnode.props as any) || {}, path.slice(), value);
						} else if (type === "state") {
							setIn((c.state as any) || {}, path.slice(), value);
						} else if (type === "context") {
							setIn((c.context as any) || {}, path.slice(), value);
						}

						c.forceUpdate();
					}
				}
			}
		},
		startPickElement: picker.start,
		stopPickElement: picker.stop,
		copy(value) {
			try {
				const data = JSON.stringify(value, null, 2);
				copyToClipboard(data);
			} catch (err) {
				console.log(err);
			}
		},
	};
}
