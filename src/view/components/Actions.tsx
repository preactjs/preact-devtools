import { h, ComponentChildren } from "preact";
import s from "./Actions.css";

export interface Props {
	children?: ComponentChildren;
}

export function Actions(props: Props) {
	return <div class={s.actions}>{props.children}</div>;
}
