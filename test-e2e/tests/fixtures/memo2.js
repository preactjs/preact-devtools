const { h, render } = preact;
const { useState } = preactHooks;
const { memo } = preactCompat;

function Value1(props) {
	return html`<p>${props.children}</p>`;
}
function Value2(props) {
	return html`<p>${props.children}</p>`;
}

function Display(props) {
	return html`
		<div data-testid="result">
			Counter: <br />
			<${Value1}>${props.value}<//>, <${Value2}>${props.value}<//>,
		</div>
	`;
}

const MemoDisplay = memo(Display);

function Counter() {
	const [v, set] = useState(0);

	return html`
		<div style="padding: 2rem;">
			<${MemoDisplay} value="42" />
			<button onClick=${() => set(v + 1)}>Increment</button>
		</div>
	`;
}

render(h(Counter), document.getElementById("app"));
