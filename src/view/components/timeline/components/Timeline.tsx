import { h } from "preact";
import s from "../../Devtools.module.css";
import { ThemeSwitcher } from "../../ThemeSwitcher";
import { useStore } from "../../../store/react-bindings";
import { SidebarLayout } from "../../SidebarLayout";

export function Timeline() {
	const store = useStore();

	return (
		<SidebarLayout>
			<ThemeSwitcher />
			<div class={s.componentActions}>Timeline bar</div>
			<div class={`${s.components} flamegraph-wrapper`}>Timeline view</div>
			<div class={s.sidebarActions}>Sidebar header</div>
			<div class={s.sidebar}>Sidebar</div>
		</SidebarLayout>
	);
}
