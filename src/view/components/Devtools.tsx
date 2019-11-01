import { h } from "preact";
import { TreeView } from "./TreeView";
import { Sidebar } from "./sidebar/Sidebar";
import s from "./Devtools.css";
import { TreeBar } from "./TreeBar";
import { AppCtx, EmitCtx } from "../store/react-bindings";
import { ModalRenderer } from "./Modals";
import { Store } from "../store/types";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { SidebarActions } from "./sidebar/SidebarActions";

export function DevTools(props: { store: Store }) {
	return (
		<EmitCtx.Provider value={props.store.emit}>
			<AppCtx.Provider value={props.store}>
				<div class={s.root + " " + s.theme}>
					<ThemeSwitcher />
					<div class={s.componentActions}>
						<TreeBar />
					</div>
					<div class={s.components}>
						<TreeView />
					</div>
					<div class={s.sidebarActions}>
						<SidebarActions />
					</div>
					<div class={s.sidebar}>
						<Sidebar />
					</div>
					<ModalRenderer />
				</div>
			</AppCtx.Provider>
		</EmitCtx.Provider>
	);
}
