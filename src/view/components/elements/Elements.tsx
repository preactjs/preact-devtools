import { h } from "preact";
import { TreeBar } from "./TreeBar.tsx";
import { TreeView } from "./TreeView.tsx";
import { SidebarActions } from "../sidebar/SidebarActions.tsx";
import { Sidebar } from "../sidebar/Sidebar.tsx";
import s from "../Devtools.module.css";
import { SidebarLayout } from "../SidebarLayout.tsx";

export function Elements() {
	return (
		<SidebarLayout>
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
		</SidebarLayout>
	);
}
