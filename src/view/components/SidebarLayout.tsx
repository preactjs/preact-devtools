import { h } from "preact";
import s from "./SidebarLayout.css";

export interface ChildProps {
	children: any;
}

export function SidebarLayout(props: ChildProps) {
	return <div class={s.root}>{props.children}</div>;
}

export function SingleLayout(props: ChildProps) {
	return <div class={s.rootSingle}>{props.children}</div>;
}
