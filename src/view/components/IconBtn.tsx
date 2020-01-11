import { h } from "preact";
import s from "./IconBtn.css";
import { ComponentChildren } from "preact";

export interface IconBtnProps {
	active?: boolean;
	title?: string;
	disabled?: boolean;
	color?: string;
	onClick?: () => void;
	children: ComponentChildren;
}

export function IconBtn(props: IconBtnProps) {
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
			<span
				class={s.inner}
				tabIndex={-1}
				style={props.color ? "color: " + props.color : undefined}
			>
				{props.children}
				<span class={s.bg} />
			</span>
		</button>
	);
}
