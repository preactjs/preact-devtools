import { h, render } from "preact";
import { useState } from "preact/hooks";

function Display({ value }) {
	const v = value !== null && typeof value === "object" ? "object" : value;
	return <div data-testid="result">Counter: {v}</div>;
}

let i = 0;
function Counter() {
	const [v, set] = useState(i);
	return (
		<div style="padding: 2rem;">
			<Display value={v} />
			<button onClick={() => set(++i)}>Reset</button>
		</div>
	);
}

render(<Counter />, document.getElementById("app"));
