const { h, render, Component } = preact;
const { useMemo, useState } = preactHooks;

function Display(props) {
	return html` <div data-testid="result">Counter: ${props.value}</div> `;
}

function Memoed() {
	return html`<div data-testid="memoed">Memoed</div>`;
}

function MemoParent() {
	return useMemo(() => h(Memoed), []);
}

class ComponentState extends Component {
	state = { value: 0 };

	render() {
		const v = this.state.value;
		return html`
			<div style="padding: 2rem;">
				<${Display} value=${v} />
				<${MemoParent} />
				<button
					data-testid="counter-1"
					onClick=${() => this.setState({ value: v + 1 })}
				>
					Increment
				</button>
			</div>
		`;
	}
}

function HookState() {
	const [v, set] = useState(0);

	return html`
		<div style="padding: 2rem;">
			<${Display} value=${v} />
			<${MemoParent} />
			<button data-testid="counter-2" onClick=${() => set(v + 1)}>
				Increment
			</button>
		</div>
	`;
}

render(
	html`
		<${ComponentState} />
		<${HookState} />
	`,
	document.getElementById("app"),
);
