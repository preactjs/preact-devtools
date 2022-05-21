import { h, render } from "preact";
import { useState } from "preact/hooks";
import { forwardRef } from "preact/compat";

function Foo() {
	return <h1>Foo</h1>;
}

const DoubleInner = forwardRef((props, ref) => {
	return <Foo {...props} ref={ref} />;
});

function DoubleForward() {
	return <DoubleInner />;
}

function App() {
	const [v, set] = useState(0);

	return (
		<div style="padding: 2rem;">
			<div data-testid="result">Counter: {v}</div>
			<button onClick={() => set(v + 1)}>Increment</button>
			<DoubleForward />
		</div>
	);
}

render(<App />, document.getElementById("app"));
