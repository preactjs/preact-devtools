import { h, render } from "preact";
import { useState } from "preact/hooks";
import { memo } from "preact/compat";

function Value(props) {
	return <p>{props.children}</p>;
}

function Display(props) {
	return <Value>Counter: {props.value}</Value>;
}

const MemoDisplay = memo(Display);

function Counter() {
	const [v, set] = useState(0);

	return (
		<div style="padding: 2rem;">
			<MemoDisplay value="42" />
			<button onClick={() => set(v + 1)}>Increment</button>
			<p data-testid="result" data-value={v}>
				{v}
			</p>
		</div>
	);
}

render(<Counter />, document.getElementById("app"));
