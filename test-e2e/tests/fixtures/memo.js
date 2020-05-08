const { h, render } = preact;
const { useState } = preactHooks;
const { memo } = preactCompat;

function Display(props) {
	return html` <div data-testid="result">Counter: ${props.value}</div> `;
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
