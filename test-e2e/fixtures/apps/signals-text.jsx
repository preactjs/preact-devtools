import { h, render } from "preact";
import { useState } from "preact/hooks";
import { useComputed, useSignal } from "@preact/signals";

function Counter() {
	const count = useSignal(0);
	const double = useComputed(() => count.value * 2);

	return (
		<div>
			<button onClick={() => count.value--}>subtract</button>
			<button onClick={() => count.value++}>add</button>
			<p>
				Value: {count} x 2 {double}
			</p>
		</div>
	);
}

function App() {
	const [, set] = useState(0);

	return (
		<div>
			<Counter />
			<button onClick={() => set((p) => p + 1)}>force update</button>
		</div>
	);
}

render(<App />, document.getElementById("app"));
