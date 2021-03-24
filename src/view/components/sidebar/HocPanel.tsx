import { h } from "preact";
import s from "./HocPanel.module.css";

export interface Props {
	hocs: string[];
}

export function Hoc(props: { children: any; small?: boolean }) {
	return (
		<span class={`${s.hoc} ${props.small ? s.small : ""} hoc-item`}>
			{props.children}
		</span>
	);
}

export function HocPanel(props: Props) {
	return (
		<div class={s.root} data-testid="hoc-panel">
			{props.hocs.map((hoc, i) => (
				<Hoc key={i}>{hoc}</Hoc>
			))}
		</div>
	);
}
