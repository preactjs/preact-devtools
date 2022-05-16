import { h, render } from "preact";
import { useState } from "preact/hooks";

function Counter() {
	const [v, set] = useState(0);

	return (
		<div style="padding: 2rem;">
			<p data-testid="result">{v}</p>
			<button onClick={() => set(v + 1)}>Increment</button>
		</div>
	);
}

function App() {
	return <Counter />;
}

render(<App />, document.getElementById("app"));
