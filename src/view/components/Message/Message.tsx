import { h } from "preact";
import s from "./Message.module.css";

const infoIcon = (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		height="24"
		viewBox="0 0 24 24"
		width="24"
	>
		<path d="M0 0h24v24H0z" fill="none" />
		<path
			d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
			fill="currentColor"
		/>
	</svg>
);

const warnIcon = (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		height="24"
		viewBox="0 0 24 24"
		width="24"
	>
		<path d="M0 0h24v24H0z" fill="none" />
		<path
			d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"
			fill="currentColor"
		/>
	</svg>
);

export interface MessageProps {
	type: "info" | "warning";
	children: any;
	testId?: string;
}

export function Message(props: MessageProps) {
	return (
		<div
			class={`${s.root} ${props.type === "info" ? s.info : s.warning}`}
			data-testid={props.testId}
		>
			<span class={s.icon}>{props.type === "info" ? infoIcon : warnIcon}</span>
			{props.children}
		</div>
	);
}

export interface MessageBtnProps {
	onClick: () => void;
	testId?: string;
	children: any;
}

export function MessageBtn(props: MessageBtnProps) {
	return (
		<button class={s.btn} onClick={props.onClick} data-testid={props.testId}>
			{props.children}
		</button>
	);
}
