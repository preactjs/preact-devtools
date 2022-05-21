import { h, render } from "preact";
import { useState } from "preact/hooks";
import { forwardRef } from "preact/compat";

function Foo() {
	return <h1>Foo</h1>;
}

const Named = forwardRef(function Named() {
	return <h1>Named</h1>;
});

const Unamed = forwardRef((props, ref) => {
	return <h1 ref={ref}>Unamed</h1>;
});

const DoubleInner = forwardRef((props, ref) => {
	return (
		<div>
			<Foo {...props} ref={ref} />
			{null}
		</div>
	);
});

const DoubleForward = forwardRef((props, ref) => {
	return <DoubleInner {...props} ref={ref} />;
});

function Display(props) {
	return <div data-testid="result">Counter: {props.value}</div>;
}

function App() {
	const [v, set] = useState(0);

	return (
		<div style="padding: 2rem;">
			<Display value={v} />
			<button onClick={() => set(v + 1)}>Increment</button>
			<Named />
			<Unamed />
			<DoubleForward />
		</div>
	);
}

render(<App />, document.getElementById("app"));
