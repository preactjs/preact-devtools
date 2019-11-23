import { h } from "preact";
import s from "./IconBtn.css";
import { ComponentChildren } from "preact";

export interface Props {
	active?: boolean;
	title?: string;
	disabled?: boolean;
	onClick?: () => void;
	children: ComponentChildren;
}

export function IconBtn(props: Props) {
	return (
		<button
			type="button"
			class={s.root}
			data-active={props.active}
			title={props.title}
			disabled={props.disabled}
			onClick={e => {
				e.stopPropagation();
				if (props.onClick) props.onClick();
			}}
		>
			<span class={s.inner} tabIndex={-1}>
				{props.children}
			</span>
		</button>
	);
}
