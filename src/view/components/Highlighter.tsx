import { h } from "preact";
import s from "./Highlighter.css";
import { Measurements } from "../../adapter/dom";

export interface Props extends Measurements {
	label: string;
}

export function Highlighter(props: Props) {
	let { width, height, top, left } = props;

	return (
		<div class={s.root} style={`top: ${top}px; left: ${left}px;`}>
			<div
				class={s.margin}
				style={`width: ${width}px; height: ${height}px; ${css2Border(
					props.marginTop,
					props.marginRight,
					props.marginBottom,
					props.marginLeft,
				)}`}
			>
				<div
					class={s.border}
					style={css2Border(
						props.borderTop,
						props.borderRight,
						props.borderBottom,
						props.borderLeft,
					)}
				>
					<div
						class={s.content}
						style={`${css2Border(
							props.paddingTop,
							props.paddingRight,
							props.paddingBottom,
							props.paddingLeft,
						)}`}
					/>
				</div>
			</div>
			<span class={s.footer}>
				<span class={s.label}>{props.label}</span> |{" "}
				<span class={s.value}>{width}px</span> ×{" "}
				<span class={s.value}>{height}px</span>
			</span>
		</div>
	);
}

export function css2Border(
	top: number,
	right: number,
	bottom: number,
	left: number,
) {
	return `
		border-top-width: ${top};
		border-right-width: ${right};
		border-bottom-width: ${bottom};
		border-left-width: ${left};
	`;
}
