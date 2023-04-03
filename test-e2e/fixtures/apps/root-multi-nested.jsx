import { h, render } from "preact";
import { useState } from "preact/hooks";

function Display(props) {
	return <div data-testid="result">Counter: {props.value}</div>;
}

function Counter({ id }) {
	const [v, set] = useState(0);

	return (
		<div style="padding: 2rem;">
			<h4>{id}</h4>
			<Display value={v} />
			<button onClick={() => set(v + 1)}>Increment</button>
		</div>
	);
}
const app1 = <Counter id="Root" />;
const app2 = <Counter id="Nested" />;
const app3 = <Counter id="Nested > Nested" />;

function linkRoots(parent, child) {
	// v10 linking
	parent.__linked_children = [child];
	child.__linked_parent = parent;

	// v11 linking
	parent.__k[0].__linked_children = [child];
	child.__linked_parent = parent;
}

linkRoots(app1, app2);
linkRoots(app2, app3);

render(app1, document.getElementById("app"));
render(app2, document.getElementById("app2"));
render(app3, document.getElementById("app3"));
