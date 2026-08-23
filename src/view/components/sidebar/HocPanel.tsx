import { h } from "preact";

export interface Props {
	hocs: string[];
}

export function Hoc(props: { children: any; small?: boolean; kind?: string }) {
	return (
		<span
			class="hoc hoc-item"
			data-size={props.small ? "small" : null}
			data-hoc-kind={props.kind}
		>
			{props.children}
		</span>
	);
}

export function HocPanel(props: Props) {
	return (
		<div class="hoc-panel" data-testid="hoc-panel">
			{props.hocs.map((hoc, i) => (
				<Hoc key={i}>{hoc}</Hoc>
			))}
		</div>
	);
}
