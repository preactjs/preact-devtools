const { h, render, Component, createContext } = preact;

let lastState;
class State extends Component {
	state = {
		value: 0,
	};

	render() {
		const out = html`
			<div data-testid="state-result">
				state: ${this.state.value}, ${String(lastState !== this.state)}
			</div>
		`;

		lastState = this.state;
		return out;
	}
}

let lastProps;
function Props(props) {
	const out = html`
		<div data-testid="props-result">
			props: ${props.value}, ${String(lastProps !== props)}
		</div>
	`;

	lastProps = props;
	return out;
}

const Ctx = createContext({ value: 0 });

let lastContext;
function Context() {
	return html`
		<${Ctx.Provider} value="${{ value: 0 }}">
			<${Ctx.Consumer}>
				${v => {
					const out = html`
						<div data-testid="context-result">
							context: ${v.value}, ${String(v !== lastContext)}
						</div>
					`;

					lastContext = v;
					return out;
				}}
			<//>
		<//>
	`;
}

let lastLegacyContext;
function LegacyConsumer(_, context) {
	const out = html`
		<div data-testid="legacy-context-result">
			legacy context: ${context.value}, ${String(lastLegacyContext !== context)}
		</div>
	`;

	lastLegacyContext = context;
	return out;
}

class LegacyContext extends Component {
	getChildContext() {
		return { value: 0 };
	}

	render() {
		return html`
			<${LegacyConsumer} />
		`;
	}
}

function App() {
	return html`
		<${Props} value=${0} />
		<${State} />
		<${Context} />
		<${LegacyContext} />
	`;
}

render(h(App), document.getElementById("app"));
