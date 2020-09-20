import { h, Fragment, render, Component } from "preact";
import { memo, forwardRef } from "preact/compat";

function Foo() {
	return <div>I am foo</div>;
}
const MemoFoo = memo(Foo);

function Last() {
	return <div>I am last</div>;
}
const MemoLast = memo(Last);

const Forward = forwardRef(function Bar(props, ref) {
	return (
		<div {...props} ref={ref}>
			forward
		</div>
	);
});

const ForwardAnonym = forwardRef((props, ref) => {
	return (
		<div {...props} ref={ref}>
			forward anonymous
		</div>
	);
});

function withBoof(Comp) {
	class Boof extends Component {
		render() {
			return <Comp {...this.props} />;
		}
	}
	Boof.displayName = "withBoof(" + (Comp.displayName || Comp.name) + ")";
	return Boof;
}

const Custom = withBoof(Foo);
const Multiple = withBoof(MemoLast);

render(
	<>
		<div>
			<b>MemoFoo</b>
		</div>
		<MemoFoo />
		<div>
			<b>ForwardRef</b>
		</div>
		<Forward />
		<div>
			<b>ForwardRef (Anonymous)</b>
		</div>
		<ForwardAnonym />
		<div>
			<b>Custom HOC</b>
		</div>
		<Custom />
		<div>
			<b>Multple HOCs</b>
		</div>
		<Multiple />
	</>,
	document.getElementById("app"),
);
