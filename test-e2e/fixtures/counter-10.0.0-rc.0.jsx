import { h, render } from "preact@10.0.0-rc.0";
import { useState } from "preact@10.0.0-rc.0/hooks";
import "preact@10.0.0-rc.0/devtools";

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

render(h(Counter), document.getElementById("app"));
