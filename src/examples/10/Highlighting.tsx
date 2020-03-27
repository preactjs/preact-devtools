import { html } from "../vendor/htm";

function Inner() {
	return html`
		<div
			style=${`
        background: #aaa;
        width: 100vh;
        position: absolute;
        left: 0;
        top: 0;
        height: 15rem;
      `}
		>
			full width
		</div>
	`;
}

export function FullWidthHighlighter() {
	return html`
		<div style="padding-top: 20rem">
			<${Inner} />
		</div>
	`;
}
