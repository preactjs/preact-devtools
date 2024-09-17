import { h, render } from "preact";
import { memo } from "preact/compat";
import { useState } from "preact/hooks";

function FooInner() {
	return <p>Foo</p>;
}

function BarInner() {
	return <p>Bar</p>;
}

function Foo() {
	return <FooInner />;
}

function Bar({ v }) {
	const innerElements = [];

	for (let i = 0; i < v; i++) {
		innerElements.push(<BarInner key={i} />);
	}
	return <div>{innerElements}</div>;
}

const MemoFoo = memo(Foo);
const MemoBar = memo(Bar);

function AppInner(props) {
	return props.children;
}

function App() {
	const [v, set] = useState(0);

	return (
		<AppInner>
			<div>
				<button onClick={() => set(v + 1)}>Update</button>
				<MemoFoo />
				<MemoBar v={v} />
			</div>
		</AppInner>
	);
}

render(<App />, document.getElementById("app"));
