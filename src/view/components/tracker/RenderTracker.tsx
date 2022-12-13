import { h } from "preact";
import { SidebarLayout } from "../SidebarLayout";
import s from "../Devtools.module.css";
import s2 from "./RenderTracker.module.css";
import { RenderTrackerTable } from "./RenderTrackerTable";
import { RenderTrackerFooter } from "./RenderTrackerFooter";
import { RenderTrackerBar } from "./RenderTrackerBar";

export function RenderTracker() {
	return (
		<div class={s2.page}>
			<SidebarLayout>
				<div class={s.componentActions}>
					<RenderTrackerBar />
				</div>
				<div class={s.components}>
					<RenderTrackerTable />
				</div>
				<div class={s.sidebarActions}>TODO</div>
				<div class={s.sidebar}>TODO</div>
			</SidebarLayout>
			<RenderTrackerFooter />
		</div>
	);
}
