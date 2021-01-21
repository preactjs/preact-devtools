const { h, render } = preact;
const {
	useState,
	useEffect,
	useReducer,
	useCallback,
	useRef,
	useLayoutEffect,
} = preactHooks;
const { addHookName } = preactDevtools;

function Display(props) {
	return html` <div data-testid=${props.testId}>Counter: ${props.value}</div> `;
}

function Counter() {
	const [v, set] = addHookName(useState(0), "customState");

	return html`
		<div style="padding: 2rem;">
			<${Display} value=${v} testId="result" />
			<button onClick=${() => set(v + 1)}>Increment</button>
		</div>
	`;
}

function CounterCallback() {
	const [v, set] = addHookName(useState(0), "counterState");
	const cb = useCallback(() => set(v + 1), [v]);

	return html`
		<div style="padding: 2rem;">
			<${Display} value=${v} testId="callback-result" />
			<button onClick=${cb}>Increment</button>
		</div>
	`;
}

function RefComponent() {
	const v = addHookName(useRef(0), "customRef");
	return html`<p>Ref: ${v.current}</p>`;
}

function ReducerComponent() {
	const [v] = addHookName(
		useReducer(a => a, "foo"),
		"customReducer",
	);
	return html`<p>Reducer: ${v}</p>`;
}

// Invalid wrappings
function CallbackOnly() {
	const cb = addHookName(
		useCallback(() => 2, []),
		"invalid",
	);

	return html`
		<div style="padding: 2rem;">
			<button onClick=${cb}>Callback: should be invalid</button>
		</div>
	`;
}

function LayoutEffect() {
	addHookName(
		useLayoutEffect(() => {}, []),
		"invalid2",
	);

	return html`<p>LayoutEffect: should be invalid</p>`;
}

function Effect() {
	addHookName(
		useEffect(() => {}, []),
		"invalid3",
	);

	return html`<p>effect: should be invalid</p>`;
}

render(
	html`
		<${Counter} />
		<${CounterCallback} />
		<${ReducerComponent} />
		<${RefComponent} />
		<p>Invalid</p>
		<${CallbackOnly} />
		<${LayoutEffect} />
		<${Effect} />
	`,
	document.getElementById("app"),
);
