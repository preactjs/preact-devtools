import { h, render } from "preact";
import { memo } from "preact/compat";
import { useState } from "preact/hooks";

function Inner() {
	return <p>Inner</p>;
}

function Foo() {
	return <Inner />;
}

const MemoFoo = memo(Foo);

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
			</div>
		</AppInner>
	);
}

render(<App />, document.getElementById("app"));
