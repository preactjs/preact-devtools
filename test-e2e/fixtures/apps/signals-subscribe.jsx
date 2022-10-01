import { h, render } from "preact";
import { signal, computed } from "@preact/signals";

const count = signal(1);
const double = computed(() => count.value * 2);

function App() {
	const source = count.value;
	const value = double.value;
	return (
		<p>
			count: {source}, double: {value}
		</p>
	);
}

render(<App />, document.getElementById("app"));
