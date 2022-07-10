import { attachCss, css } from "../../adapter/adapter/custom-element";
import { Dimensions, Measurements } from "../../adapter/dom";

export function css2Border(dim: Dimensions) {
	return `
		border-top-width: ${dim[0]}px;
		border-right-width: ${dim[1]}px;
		border-bottom-width: ${dim[2]}px;
		border-left-width: ${dim[3]}px;
	`;
}

const sheet = css`
	:host {
		font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier,
			monospace;
		color: #bebebe;
		font-size: 0.75rem;
		text-align: center;
		position: absolute;
		pointer-events: none;
		z-index: 999999;
	}

	.content {
		background: rgba(136, 194, 232, 0.75);
		border-color: rgba(5, 150, 45, 0.5);
		border-style: solid;
		width: 100%;
		height: 100%;
		display: flex;
		flex: 1;
	}

	.border {
		border-color: rgba(255, 241, 118, 0.75);
		border-style: solid;
		display: flex;
		flex: 1;
	}

	.margin {
		border-color: rgba(236, 169, 99, 0.75);
		border-style: solid;
		display: flex;
	}

	.label {
		color: #fda5e9;
	}

	.value {
		color: #ececec;
	}

	.footer {
		display: inline-block;
		white-space: nowrap;
		margin: 0.5rem 0 0 0;
		border-radius: 0.2rem;
		padding: 0.125rem 0.4rem;
		background: #101010;
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
		border: 0.0625rem solid #9a9a9a;
		font-weight: bold;
	}

	.fixed {
		position: fixed;
	}

	.fixed.fixedLeft {
		left: 1.5em;
		transform: translateX(0);
	}

	.fixed.fixedTop {
		top: 1.5em;
	}

	.fixed.fixedRight {
		right: 1.5em;
	}

	.fixed.fixedBottom {
		bottom: 1.5em;
	}

	.outerContainer {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		pointer-events: none;
	}
`;

export class Highlighter extends HTMLElement {
	constructor() {
		super();
		attachCss(this, sheet);
	}

	connectedCallback() {
		this.shadowRoot!.innerHTML = `<div class="margin"><div class="border"><div class="content"></div></div></div><span class="footer"><span class="label"><slot /></span> | <span class="value"></span> × <span class="value"></span></span>`;
	}

	set props(props: Measurements) {
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

		this.style.top = top + "px";
		this.style.left = left + "px";
		// console.log(this.shadowRoot.fir)

		const marginDiv = this.shadowRoot!.firstChild as HTMLDivElement;
		marginDiv.style.cssText = `width: ${width}px; height: ${height}px; ${css2Border(
			margin,
		)}`;

		const borderDiv = marginDiv.firstChild as HTMLDivElement;
		borderDiv.style.cssText = css2Border(props.border);

		const contentDiv = borderDiv.firstChild as HTMLDivElement;
		contentDiv.style.cssText = `${css2Border(padding)} ${contentBoxCss}`;

		const footer = marginDiv.nextSibling as HTMLSpanElement;
		footer.classList.toggle("fixed", isOutOfBounds);
		footer.classList.toggle("fixedLeft", bounds[3] && !bounds[1]);
		footer.classList.toggle("fixedRight", bounds[1]);
		footer.classList.toggle("fixedTop", bounds[0] && !bounds[2]);
		footer.classList.toggle("fixedBottom", bounds[2]);

		const spanLabel = footer.firstChild! as HTMLSpanElement;
		spanLabel.nextElementSibling!.textContent = width + "px";
		spanLabel.nextElementSibling!.nextElementSibling!.textContent =
			height + "px";
	}
}
