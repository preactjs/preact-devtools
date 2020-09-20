import { h, render } from "preact";
import { useState } from "preact/hooks";

function Display(props) {
	return `Counter: ${props.value}`;
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

render(<Counter />, document.getElementById("app"));
