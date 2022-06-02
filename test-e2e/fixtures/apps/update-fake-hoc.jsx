import { Fragment, h, render } from "preact";
import { useState } from "preact/hooks";

function Display(props) {
	return <div data-testid="result">Counter: {props.value}</div>;
}

function ListItem(props) {
	return <p>{props.children}</p>;
}

function List(props) {
	return (
		<Fragment>
			{new Array(props.v).fill(0).map((_, i) => (
				<ListItem key={i}>{i}</ListItem>
			))}
		</Fragment>
	);
}

function Foo(props) {
	return props.children;
}

function Counter() {
	const [v, set] = useState(0);

	return (
		<div style="padding: 2rem;">
			<Foo>
				<Display value={v} />
				<button onClick={() => set(v + 1)}>Increment</button>
				<List v={v} />
			</Foo>
		</div>
	);
}

Counter.displayName = "Counter(Foo)";

function App() {
	return <Counter />;
}

render(<App />, document.getElementById("app"));
