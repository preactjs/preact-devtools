import { h, Fragment, render } from "preact";
import { useState } from "preact/hooks";

function Display(props) {
	return <div data-testid="result">Counter: {props.value}</div>;
}

let i = 0;
function Counter() {
	const [v, set] = useState(0);

	return (
		<div style="padding: 2rem;">
			<Display value={v} />
			<button id={"counter-1" + i++} onClick={() => set(v + 1)}>
				Increment
			</button>
		</div>
	);
}

function Foo() {
	return (
		<Fragment>
			<div>foo</div>
			<Counter />
		</Fragment>
	);
}

function App() {
	const [enabled, setEnabled] = useState(false);
	return (
		<Fragment>
			<button onClick={() => setEnabled(!enabled)}>Toggle</button>
			{enabled && (
				<Fragment>
					<Counter />
					<Foo />
				</Fragment>
			)}
		</Fragment>
	);
}

render(<App />, document.getElementById("app"));
