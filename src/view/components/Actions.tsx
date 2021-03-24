import { h, ComponentChildren } from "preact";
import s from "./Actions.module.css";

export interface Props {
	class?: string;
	children?: ComponentChildren;
}

export function Actions(props: Props) {
	return (
		<div class={`${s.actions} ${props.class || ""}`}>{props.children}</div>
	);
}

export function ActionSeparator() {
	return <div class={s.sep} />;
}
