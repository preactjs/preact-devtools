const { h, render } = preact;
const {
	useState,
	useEffect,
	useReducer,
	useCallback,
	useRef,
	useLayoutEffect,
	useMemo,
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

function MemoComponent() {
	const v = addHookName(
		useMemo(() => 0, []),
		"customMemo",
	);
	return html`<p>Memo: ${v}</p>`;
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

function Multiple() {
	const [foo, set] = addHookName(useState(0), "foo");
	const [bar, set2] = addHookName(useState(0), "bar");
	const [baz, set3] = addHookName(useState(0), "baz");

	return html`<p>multiple: should be valid: ${foo}, ${bar}, ${baz}</p>`;
}

render(
	html`
		<${Counter} />
		<${CounterCallback} />
		<${ReducerComponent} />
		<${RefComponent} />
		<${MemoComponent} />
		<p>Invalid</p>
		<${CallbackOnly} />
		<${LayoutEffect} />
		<${Effect} />
		<${Multiple} />
	`,
	document.getElementById("app"),
);
