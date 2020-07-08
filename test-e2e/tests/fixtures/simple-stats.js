const { h, render, Component } = preact;

function FnComponent() {
	return html`<div>Function ${"Component"}</div>`;
}

class ClassComponent extends Component {
	render() {
		return html`<div>Class Component</div>`;
	}
}

render(
	html`
		<div>foo</div>
		bar
		<span>bob</span>
		<${FnComponent} />
		<${ClassComponent} />
	`,
	document.getElementById("app"),
);
