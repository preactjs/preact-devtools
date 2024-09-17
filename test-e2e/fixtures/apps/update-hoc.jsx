import { Fragment, h, render } from "preact";
import { useState } from "preact/hooks";
import { memo } from "preact/compat";

function Display(props) {
	return <div data-testid="result">Counter: {props.value}</div>;
}

function ListItem(props) {
	return <p>{props.children}</p>;
}

function List(props) {
	return (
		<Fragment>
			{
				// eslint-disable-next-line no-new-array
				new Array(props.v).fill(0).map((_, i) => (
					<ListItem key={i}>{i}</ListItem>
				))
			}
		</Fragment>
	);
}

function Foo(props) {
	return props.children;
}

const MemoFoo = memo(Foo);

function Counter() {
	const [v, set] = useState(0);

	return (
		<div style="padding: 2rem;">
			<MemoFoo>
				<Display value={v} />
				<button onClick={() => set(v + 1)}>Increment</button>
				<List v={v} />
			</MemoFoo>
		</div>
	);
}

function App() {
	return <Counter />;
}

render(<App />, document.getElementById("app"));
