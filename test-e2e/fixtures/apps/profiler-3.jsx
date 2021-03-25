import { h, render } from "preact";
import { useState } from "preact/hooks";

function Value(props) {
	return <p>{props.children}</p>;
}

function Display(props) {
	return (
		<div data-testid="result">
			Counter: <Value>{props.value}</Value>
		</div>
	);
}

let i = 1;
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
		<>
			<div>foo</div>
			<Counter />
		</>
	);
}

render(<Foo />, document.getElementById("app"));
