const { h, render } = preact;
const { useState } = preactHooks;

/**
 * Synchronously blocking function. Works by pegging the CPU.
 */
function sleep(ms) {
	const startTime = new Date().getTime();
	while (new Date().getTime() < startTime + ms);
}

function Value(props) {
	return html`<p>${props.children}</p>`;
}

function Display(props) {
	sleep(5);
	return html`
		<div data-testid="result">Counter: <${Value}>${props.value}<//></div>
	`;
}

let i = 1;
function Counter() {
	const [v, set] = useState(0);

	sleep(10);

	return html`
		<div style="padding: 2rem;">
			<${Display} value=${v} />
			<button id="counter-1${i++}" onClick=${() => set(v + 1)}>
				Increment
			</button>
		</div>
	`;
}

function Foo() {
	return html`
		<div>foo</div>
		<${Counter} />
	`;
}

render(h(Foo), document.getElementById("app"));
