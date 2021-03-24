const { h, render } = preact;
const { useState } = preactHooks;

function Display(props) {
	return html` <div data-testid="result">Counter: ${props.value}</div> `;
}

function Counter() {
	const [v, set] = useState(0);

	return html`
		<div style="padding: 2rem;">
			<${Display} value=${v} />
			<button onClick=${() => set(v + 1)}>Increment</button>
		</div>
	`;
}

function Foo() {
	return html` <div>foo</div> `;
}

function App() {
	return html`
		<${Counter} />
		<${Foo} />
	`;
}

render(h(App), document.getElementById("app"));
