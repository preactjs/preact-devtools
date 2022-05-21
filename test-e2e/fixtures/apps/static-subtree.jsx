import { h, render } from "preact";
import { useState } from "preact/hooks";
import { memo } from "preact/compat";

function Display(props) {
	blockFor(10);
	return <div data-testid="result">Counter: {props.value}</div>;
}

function blockFor(ms) {
	const start = Date.now();
	while (Date.now() - start < ms) {
		//
	}
}

function Foo() {
	blockFor(75);
	return <p>Foo</p>;
}

function Static() {
	blockFor(100);
	return <Foo />;
}

const MemoStatic = memo(Static);

function App() {
	const [v, set] = useState(0);

	blockFor(10);

	return (
		<div style="padding: 2rem;">
			<MemoStatic key={v < 1 ? NaN : "1"} />
			<Display key="2" value={v} />
			<MemoStatic key={v < 1 ? NaN : "3"} />
			<button key="4" onClick={() => set(v + 1)}>
				Increment
			</button>
		</div>
	);
}

render(<App />, document.getElementById("app"));
