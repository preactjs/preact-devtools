import { h, Fragment, render, Component } from "preact";
import { useState } from "preact/hooks";

function SymbolComponent() {
	const [v] = useState(Symbol("foobar"));

	return <div style="padding: 2rem;">{v.toString()}</div>;
}

function Child(props) {
	return <div>{props.children.toString()}</div>;
}

function PropComponent() {
	return (
		<div style="padding: 2rem;">
			<Child>{Symbol("foobar")}</Child>
		</div>
	);
}

class ClassComponent extends Component {
	constructor(props) {
		super(props);
		this.state = {
			value: Symbol("foobar"),
		};
	}

	render() {
		return <div>{this.state.value.toString()}</div>;
	}
}

render(
	<>
		<SymbolComponent />
		<PropComponent />
		<ClassComponent />
	</>,
	document.getElementById("app"),
);
