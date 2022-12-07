import { h, render } from "preact";
import { createPortal, useState } from "preact/compat";

function Display() {
	return <div data-testid="result">Portal</div>;
}

function App() {
	const [v, set] = useState(0);

	return (
		<div>
			<button onClick={() => set(p => p + 1)}>update</button>
			{createPortal(<Display />, document.getElementById("app2"))}
		</div>
	);
}

render(<App />, document.getElementById("app"));
