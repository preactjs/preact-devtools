import { h, render } from "preact";
import { useState } from "preact/hooks";
import { memo } from "preact/compat";
import "preact/devtools";

function Value(props) {
	return <p>{props.children}</p>;
}

function Display(props) {
	return (
		<div data-testid="result">
			Counter: <br />
			<Value>{props.value}</Value>,<Value>{props.value}</Value>
		</div>
	);
}

const MemoDisplay = memo(Display);

function Counter() {
	const [v, set] = useState(0);

	return (
		<div style="padding: 2rem;">
			<MemoDisplay value="42" />
			<button onClick={() => set(v + 1)}>Increment</button>
		</div>
	);
}

render(<Counter />, document.getElementById("app"));
