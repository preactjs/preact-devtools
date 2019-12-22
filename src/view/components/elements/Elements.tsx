import { h, Fragment } from "preact";
import { TreeBar } from "../TreeBar";
import { TreeView } from "../TreeView";
import { SidebarActions } from "../sidebar/SidebarActions";
import { Sidebar } from "../sidebar/Sidebar";
import { ModalRenderer } from "../Modals";
import s from "../Devtools.css";

export function Elements() {
	return (
		<Fragment>
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
		</Fragment>
	);
}
