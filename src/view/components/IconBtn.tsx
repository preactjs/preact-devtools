import { h } from "preact";
import s from "./IconBtn.css";
import { ComponentChildren } from "preact";

export interface Props {
	active?: boolean;
	title?: string;
	onClick?: () => void;
	children: ComponentChildren;
}

export function IconBtn(props: Props) {
	return (
		<button
			class={s.root}
			data-active={props.active}
			title={props.title}
			onClick={props.onClick}
		>
			{props.children}
		</button>
	);
}
