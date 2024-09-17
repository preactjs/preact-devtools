/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Fragment, h, render } from "preact";
import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useReducer,
	useRef,
	useState,
} from "preact/hooks";
import { addHookName } from "preact/devtools";

function Display(props) {
	return <div data-testid={props.testId}>Counter: {props.value}</div>;
}

function Counter() {
	const [v, set] = addHookName(useState(0), "customState");

	return (
		<div style="padding: 2rem;">
			<Display value={v} testId="result" />
			<button onClick={() => set(v + 1)}>Increment</button>
		</div>
	);
}

function CounterCallback() {
	const [v, set] = addHookName(useState(0), "counterState");
	const cb = useCallback(() => set(v + 1), [v]);

	return (
		<div style="padding: 2rem;">
			<Display value={v} testId="callback-result" />
			<button onClick={cb}>Increment</button>
		</div>
	);
}

function RefComponent() {
	const v = addHookName(useRef(0), "customRef");
	return <p>Ref: {v.current}</p>;
}

function MemoComponent() {
	const v = addHookName(
		useMemo(() => 0, []),
		"customMemo",
	);
	return <p>Memo: {v}</p>;
}

function ReducerComponent() {
	const [v] = addHookName(
		useReducer((a) => a, "foo"),
		"customReducer",
	);
	return <p>Reducer: {v}</p>;
}

function Multiple() {
	const [foo, set] = addHookName(useState(0), "foo");
	const [bar, set2] = addHookName(useState(0), "bar");
	const [baz, set3] = addHookName(useState(0), "baz");

	return (
		<p>
			multiple: should be valid: {foo}, {bar}, {baz}
		</p>
	);
}

// Invalid wrappings
function CallbackOnly() {
	const cb = addHookName(
		useCallback(() => 2, []),
		"invalid",
	);

	return (
		<div style="padding: 2rem;">
			<button onClick={cb}>Callback: should be invalid</button>
		</div>
	);
}

function LayoutEffect() {
	addHookName(
		useLayoutEffect(() => {}, []),
		"invalid2",
	);

	return <p>LayoutEffect: should be invalid</p>;
}

function Effect() {
	addHookName(
		useEffect(() => {}, []),
		"invalid3",
	);

	return <p>effect: should be invalid</p>;
}

render(
	<Fragment>
		<Counter />
		<CounterCallback />
		<ReducerComponent />
		<RefComponent />
		<MemoComponent />
		<Multiple />
		<p>Invalid</p>
		<CallbackOnly />
		<LayoutEffect />
		<Effect />
	</Fragment>,
	document.getElementById("app"),
);
