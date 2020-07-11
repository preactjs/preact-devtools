const { h, render, Component } = preact;

function FnComponent() {
	return html`<div>Function ${"Component"}</div>`;
}

class ClassComponent extends Component {
	render() {
		return html`<div>
			Class Component
			<button data-testid="update" onClick=${() => this.setState({})}>
				update
			</button>
			<div>foo</div>
			<span>bob</span>
			<${FnComponent} />
		</div>`;
	}
}

render(html`<${ClassComponent} />`, document.getElementById("app"));
