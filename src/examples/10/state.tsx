// @ts-ignore
import { Component } from "../vendor/preact-10";
import { html } from "../vendor/htm";

export interface State {
	foo: number;
}

export class Stateful extends Component<any, State> {
	state: State = {
		foo: 0,
	};

	render() {
		return html`
			<div>
				<div>State: ${this.state.foo}</div>
				<button
					onClick=${() =>
						(this as any).setState((p: any) => ({ foo: p.foo + 1 }))}
				>
					Update
				</button>
			</div>
		`;
	}
}
