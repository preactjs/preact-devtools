import { h } from "preact";
import { TreeView } from "./TreeView";
import { Sidebar } from "./Sidebar";
import s from "./Devtools.css";
import { TreeBar } from "./TreeBar";
import { AppCtx, Store } from "../store";

export function DevTools(props: { store: Store }) {
	return (
		<AppCtx.Provider value={props.store}>
			<div class={s.root}>
				<div class={s.components}>
					<TreeBar />
					<TreeView rootId={1} />
				</div>
				<div class={s.sidebar}>
					<Sidebar title="Hydrator" />
				</div>
			</div>
		</AppCtx.Provider>
	);
}
