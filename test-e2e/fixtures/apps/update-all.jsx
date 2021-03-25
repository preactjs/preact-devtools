import { h, Fragment, render, Component, createContext } from "preact";

let lastState;
class State extends Component {
	constructor(props) {
		super(props);
		this.state = {
			value: 0,
		};
	}

	render() {
		const out = (
			<div data-testid="state-result">
				state: {this.state.value}, {String(lastState !== this.state)}
			</div>
		);

		lastState = this.state;
		return out;
	}
}

let lastProps;
function Props(props) {
	const out = (
		<div data-testid="props-result">
			props: {props.value}, {String(lastProps !== props)}
		</div>
	);
	lastProps = props;
	return out;
}

const Ctx = createContext({ value: 0 });

let lastContext;
function Context() {
	return (
		<Ctx.Provider value={{ value: 0 }}>
			<Ctx.Consumer>
				{v => {
					const out = (
						<div data-testid="context-result">
							context: {v.value}, {String(v !== lastContext)}
						</div>
					);

					lastContext = v;
					return out;
				}}
			</Ctx.Consumer>
		</Ctx.Provider>
	);
}

function LegacyConsumer(_, context) {
	return (
		<div data-testid="legacy-context-result">
			legacy context: {context.value}
		</div>
	);
}

class LegacyContext extends Component {
	getChildContext() {
		return { value: 0 };
	}

	render() {
		return <LegacyConsumer />;
	}
}

function App() {
	return (
		<Fragment>
			<Props value={0} />
			<State />
			<Context />
			<LegacyContext />
		</Fragment>
	);
}

render(<App />, document.getElementById("app"));
