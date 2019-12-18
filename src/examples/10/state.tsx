import { h, Component } from "../vendor/preact-10";

export interface State {
	foo: number;
}

export class Stateful extends Component<any, State> {
	state: State = {
		foo: 0,
	};

	render() {
		return (
			<div>
				<div>State: {this.state.foo}</div>
				<button onClick={() => this.setState(p => ({ foo: p.foo + 1 }))}>
					Update
				</button>
			</div>
		);
	}
}
