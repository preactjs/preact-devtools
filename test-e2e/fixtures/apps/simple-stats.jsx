import { h, render, Component } from "preact";

function FnComponent() {
	return <div>Function {"Component"}</div>;
}

class ClassComponent extends Component {
	render() {
		return (
			<div>
				Class Component
				<button data-testid="update" onClick={() => this.setState({})}>
					update
				</button>
				<div>foo</div>
				<span>bob</span>
				<FnComponent />
			</div>
		);
	}
}

render(<ClassComponent />, document.getElementById("app"));
