import { h, render } from "preact";
import { useState } from "preact/hooks";
import { useComputed, useSignal } from "@preact/signals";

function Display({ label, value }) {
	return (
		<p>
			{label}: {value}
		</p>
	);
}

function Counter() {
	const count = useSignal(0);
	const double = useComputed(() => count.value * 2);

	return (
		<div>
			<button onClick={() => count.value--}>subtract</button>
			<button onClick={() => count.value++}>add</button>
			<div id="result">
				<Display label="value" value={count} />,
				<Display label="double" value={double} />
			</div>
		</div>
	);
}

function App() {
	const [, set] = useState(0);

	return (
		<div>
			<Counter />
			<button onClick={() => set(p => p + 1)}>force update</button>
		</div>
	);
}

render(<App />, document.getElementById("app"));
