import { h } from "preact";
import s from "./Sidebar.css";
import { SidebarPanel } from "./SidebarPanel";
import { Actions } from "./Actions";

export interface Props {
	title: string;
}

export function Sidebar(props: Props) {
	return (
		<aside class={s.root}>
			<Actions>
				<span class={s.title}>{props.title}</span>
			</Actions>
			<div class={s.body}>
				<SidebarPanel title="props" empty="None"></SidebarPanel>
				<SidebarPanel title="state" empty="None"></SidebarPanel>
				<SidebarPanel title="context" empty="None"></SidebarPanel>
				<SidebarPanel title="hooks" empty="None"></SidebarPanel>
				<SidebarPanel title="rendered by" empty="None"></SidebarPanel>
			</div>
		</aside>
	);
}
