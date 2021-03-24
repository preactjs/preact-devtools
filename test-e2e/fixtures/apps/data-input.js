const { h, render } = preact;
const { useState } = preactHooks;

function Display({ value }) {
	const v = value !== null && typeof value === "object" ? "object" : value;
	return html` <div data-testid="result">Counter: ${v}</div> `;
}

let i = 0;
function Counter() {
	const [v, set] = useState(i);
	return html`
		<div style="padding: 2rem;">
			<${Display} value=${v} />
			<button onClick=${() => set(++i)}>Reset</button>
		</div>
	`;
}

render(h(Counter), document.getElementById("app"));
