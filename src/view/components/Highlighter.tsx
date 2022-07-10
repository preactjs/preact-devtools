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

function template(html: string) {
	const tpl = document.createElement("template");
	tpl.innerHTML = html;
	return tpl.content.firstChild!;
}

const dom = template(
	`<div class="${s.root}" data-testid="highlight"><div class="${s.margin}"><div class="${s.border}"><div class="${s.content}"></div></div></div><span><span class="${s.label}"></span> | <span class="${s.value}"></span> × <span class="${s.value}"></span></span></div>`,
);

export class Highlighter {
	private id = "preact-devtools-highlighter";
	private dom: HTMLDivElement | null = null;

	mount() {
		const root = document.createElement("div");
		root.id = this.id;
		root.className = style.outerContainer;
		document.body.appendChild(root);

		this.dom = dom.cloneNode(true) as HTMLDivElement;
		root.appendChild(this.dom);
	}

	destroy() {
		document.getElementById(this.id)?.remove();
	}

	render(props: Props) {
		if (!this.dom) {
			this.mount();
		}

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

		const el = this.dom!;
		el.style.cssText = `top: ${top}px; left: ${left}px;`;

		const marginDiv = el.firstChild as HTMLDivElement;
		marginDiv.style.cssText = `width: ${width}px; height: ${height}px; ${css2Border(
			margin,
		)}`;

		const borderDiv = marginDiv.firstChild as HTMLDivElement;
		borderDiv.style.cssText = css2Border(props.border);

		const contentDiv = borderDiv.firstChild as HTMLDivElement;
		contentDiv.style.cssText = `${css2Border(padding)} ${contentBoxCss}`;

		const footer = marginDiv.nextSibling as HTMLSpanElement;
		const fixed = isOutOfBounds ? s.fixed : "";
		const fixedLeft = bounds[3] && !bounds[1] ? s.fixedLeft : "";
		const fixedRight = bounds[1] ? s.fixedRight : "";
		const fixedTop = bounds[0] && !bounds[2] ? s.fixedTop : "";
		const fixedBottom = bounds[2] ? s.fixedBottom : "";

		footer.className = `${s.footer} ${fixed} ${fixedLeft} ${fixedRight} ${fixedTop}  ${fixedBottom}`;

		const spanLabel = footer.firstChild! as HTMLSpanElement;
		spanLabel.textContent = props.label;
		spanLabel.nextElementSibling!.textContent = width + "px";
		spanLabel.nextElementSibling!.nextElementSibling!.textContent =
			height + "px";
	}
}
