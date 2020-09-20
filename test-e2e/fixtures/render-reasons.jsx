import { h, render, Component } from "preact";
import { useMemo, useState } from "preact/hooks";

function Display(props) {
	return <div data-testid={props.testid}>Counter: ${props.value}</div>;
}

function Memoed() {
	return <div data-testid="memoed">Memoed</div>;
}

function MemoParent() {
	return useMemo(() => h(Memoed), []);
}

class ComponentState extends Component {
	constructor(props) {
		super(props);
		this.state = { value: 0 };
	}

	render() {
		const v = this.state.value;
		return (
			<div style="padding: 2rem;">
				<Display value={v} testid="result-1" />
				<MemoParent />
				<button
					data-testid="counter-1"
					onClick={() => this.setState({ value: v + 1 })}
				>
					Increment class state
				</button>
			</div>
		);
	}
}

function HookState() {
	const [v, set] = useState(0);

	return (
		<div style="padding: 2rem;">
			<Display value={v} testid="result-2" />
			<MemoParent />
			<button data-testid="counter-2" onClick={() => set(v + 1)}>
				Increment hook state
			</button>
		</div>
	);
}

class ForceUpdate extends Component {
	render() {
		return (
			<div style="padding: 2rem;">
				<MemoParent />
				<button data-testid="force-update" onClick={() => this.forceUpdate()}>
					Force Update
				</button>
			</div>
		);
	}
}

class ComponentMultiState extends Component {
	constructor(props) {
		super(props);
		this.state = { counter: 0, other: 0 };
	}

	render() {
		const v = this.state.counter;
		return (
			<div style="padding: 2rem;">
				<Display value={v} />
				<MemoParent />
				<button
					data-testid="class-state-multi"
					onClick={() => this.setState({ counter: v + 1, other: v + 2 })}
				>
					Increment multi class state
				</button>
			</div>
		);
	}
}

render(
	<>
		<ComponentState />
		<HookState />
		<ForceUpdate />
		<ComponentMultiState />
	</>,
	document.getElementById("app"),
);
