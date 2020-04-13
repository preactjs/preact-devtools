const { h, render } = preact;
const { useState, useEffect, useLayoutEffect } = preactHooks;

function Display(props) {
	return html` <div data-testid=${props.testId}>Counter: ${props.value}</div> `;
}

function Counter() {
	const [v, set] = useState(0);

	return html`
		<div style="padding: 2rem;">
			<${Display} value=${v} testId="result" />
			<button onClick=${() => set(v + 1)}>Increment</button>
		</div>
	`;
}

function CounterCallback() {
	const [v, set] = useState(0);

	return html`
		<div style="padding: 2rem;">
			<${Display} value=${v} testId="callback-result" />
			<button onClick=${() => set(v + 1)}>Increment</button>
		</div>
	`;
}

let layoutEffect = 0;
function LayoutEffect() {
	useLayoutEffect(() => {
		layoutEffect++;
	}, []);

	return html`<p>LayoutEffect: ${layoutEffect}</p>`;
}

let effect = 0;
function Effect() {
	useEffect(() => {
		effect++;
	}, []);

	return html`<p>effect: ${effect}</p>`;
}

let customHook = 0;
const useBar = () => {
	useEffect(() => customHook++, []);
	return useState(false);
};

const useFoo = () => {
	return useBar();
};

function CustomHooks() {
	const [v] = useFoo();
	return html`<p>Custom hooks: ${"" + v}, ${customHook}</p>`;
}

render(
	html`
		<${Counter} />
		<${CounterCallback} />
		<${LayoutEffect} />
		<${Effect} />
		<${CustomHooks} />
	`,
	document.getElementById("app"),
);
