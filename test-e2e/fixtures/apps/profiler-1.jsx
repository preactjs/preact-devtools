import { h, Fragment, render } from "preact";
import { useState } from "preact/hooks";

function Display(props) {
	return <div data-testid="result">Counter: {props.value}</div>;
}

function Counter() {
	const [v, set] = useState(0);

	return (
		<div style="padding: 2rem;">
			<Display value={v} />
			<button onClick={() => set(v + 1)}>Increment</button>
		</div>
	);
}

function Foo() {
	return <div>foo</div>;
}

function App() {
	return (
		<Fragment>
			<Counter />
			<Foo />
		</Fragment>
	);
}

render(<App />, document.getElementById("app"));
