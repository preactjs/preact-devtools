import { h } from "preact";
import s from "./Highlighter.module.css";
import { Dimensions, Measurements } from "../../adapter/dom";

export function css2Border(dim: Dimensions) {
	return `
		border-top-width: ${dim[0]}px;
		border-right-width: ${dim[1]}px;
		border-bottom-width: ${dim[2]}px;
		border-left-width: ${dim[3]}px;
	`;
}

export const style = s;

export interface Props extends Measurements {
	label: string;
}

export function Highlighter(props: Props) {
	const {
		width,
		height,
		boxSizing,
		top,
		left,
		bounds,
		padding,
		margin,
	} = props;

	const isOutOfBounds = bounds[0] || bounds[1] || bounds[2] || bounds[3];

	let contentBoxCss = "";
	if (boxSizing === "content-box") {
		const diffHeight = padding[0] + padding[2];
		const diffWidth = padding[1] + padding[3];
		contentBoxCss += `height: calc(100% - ${diffHeight}px);`;
		contentBoxCss += `width: calc(100% - ${diffWidth}px);`;
	}

	return (
		<div
			class={s.root}
			data-testid="highlight"
			style={`top: ${top}px; left: ${left}px;`}
		>
			<div
				class={s.margin}
				style={`width: ${width}px; height: ${height}px; ${css2Border(margin)}`}
			>
				<div class={s.border} style={css2Border(props.border)}>
					<div
						class={s.content}
						style={`${css2Border(padding)} ${contentBoxCss}`}
					/>
				</div>
			</div>
			<span
				class={`${s.footer} ${isOutOfBounds ? s.fixed : ""} ${
					bounds[3] && !bounds[1] ? s.fixedLeft : ""
				} ${bounds[1] ? s.fixedRight : ""} ${
					bounds[0] && !bounds[2] ? s.fixedTop : ""
				}  ${bounds[2] ? s.fixedBottom : ""}`}
			>
				<span class={s.label}>{props.label}</span> |{" "}
				<span class={s.value}>{width}px</span> ×{" "}
				<span class={s.value}>{height}px</span>
			</span>
		</div>
	);
}
