import { h } from "../vendor/preact-10";

function Inner() {
	return (
		<div
			style={`
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
	);
}

export function FullWidthHighlighter() {
	return (
		<div style="padding-top: 20rem">
			<Inner />
		</div>
	);
}
