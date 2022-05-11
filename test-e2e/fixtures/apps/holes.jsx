import { h, render } from "preact";
import { useState } from "preact/hooks";

function Foo(props) {
	return props.children;
}

function App() {
	const [v, set] = useState(0);

	return (
		<Foo>
			{v % 2 === 0 && "Not a placeholder"}
			<button onClick={() => set(v + 1)}>Increment</button>
		</Foo>
	);
}

render(<App />, document.getElementById("app"));
