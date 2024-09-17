import { Fragment, h, render } from "preact";
import { useState } from "preact/hooks";

function Display(props) {
	return <div data-testid="result">Counter: {props.value}</div>;
}

function Counter({ num }) {
	const [v, set] = useState(0);

	return (
		<div style="padding: 2rem;">
			<Display value={v} />
			<button data-testid={"counter-" + num} onClick={() => set(v + 1)}>
				Increment
			</button>
		</div>
	);
}

function Foo() {
	return (
		<Fragment>
			<div>foo</div>
			<Counter num={2} />
		</Fragment>
	);
}

function App() {
	return (
		<Fragment>
			<Counter num={1} />
			<Foo />
		</Fragment>
	);
}

render(<App />, document.getElementById("app"));
