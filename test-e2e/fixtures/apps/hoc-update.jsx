import { h, Fragment, render, Component } from "preact";
import { memo, forwardRef } from "preact/compat";

function Foo() {
	return <div>I am foo</div>;
}
const MemoFoo = memo(Foo);

function Wrapped(props) {
	return <div>{props.children}</div>;
}

const Forward = forwardRef(function Bar(props, ref) {
	return (
		<div {...props} ref={ref}>
			forward
		</div>
	);
});

function withBoof(Comp) {
	class Boof extends Component {
		render() {
			return (
				<div>
					<button
						onClick={() => this.setState(p => ({ condition: !p.condition }))}
					>
						Update
					</button>
					<Comp {...this.props}>
						{this.state.condition ? <MemoFoo /> : <Forward />}
					</Comp>
				</div>
			);
		}
	}
	Boof.displayName = "withBoof(" + (Comp.displayName || Comp.name) + ")";
	return Boof;
}

const Custom = withBoof(Wrapped);

render(
	<>
		<div>
			<b>Custom HOC</b>
		</div>
		<Custom />
	</>,
	document.getElementById("app"),
);
