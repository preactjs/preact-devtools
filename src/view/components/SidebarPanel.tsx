import { h, ComponentChildren } from "preact";
import s from "./SidebarPanel.css";

export interface Props {
	title: string;
	empty: string;
	children?: ComponentChildren;
}

export function SidebarPanel(props: Props) {
	return (
		<div class={s.panel}>
			<h3 class={s.title}>{props.title}</h3>
			<div class={s.content}>
				<span class={s.empty}>{props.empty}</span>
			</div>
		</div>
	);
}
