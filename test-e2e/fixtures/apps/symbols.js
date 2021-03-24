const { render, Component } = preact;
const { useState } = preactHooks;

function SymbolComponent() {
	const [v] = useState(Symbol("foobar"));

	return html` <div style="padding: 2rem;">${v.toString()}</div> `;
}

function Child(props) {
	return html`<div>${props.children.toString()}</div>`;
}

function PropComponent() {
	return html`
		<div style="padding: 2rem;">
			<${Child}>${Symbol("foobar")}<//>
		</div>
	`;
}

class ClassComponent extends Component {
	constructor(props) {
		super(props);
		this.state = {
			value: Symbol("foobar"),
		};
	}

	render() {
		return html`<div>${this.state.value.toString()}</div>`;
	}
}

render(
	html`
		<${SymbolComponent} />
		<${PropComponent} />
		<${ClassComponent} />
	`,
	document.getElementById("app"),
);
