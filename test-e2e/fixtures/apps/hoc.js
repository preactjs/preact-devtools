const { render, Component } = preact;
const { memo, forwardRef } = preactCompat;

function Foo() {
	return html`<div>I am foo</div>`;
}
const MemoFoo = memo(Foo);

function Last() {
	return html`<div>I am last</div>`;
}
const MemoLast = memo(Last);

const Forward = forwardRef(function Bar(props, ref) {
	return html`<div ...${props} ref=${ref}>forward</div>`;
});

const ForwardAnonym = forwardRef((props, ref) => {
	return html`<div ...${props} ref=${ref}>forward anonymous</div>`;
});

function withBoof(Comp) {
	class Boof extends Component {
		render() {
			return html`<${Comp} ...${this.props} />`;
		}
	}
	Boof.displayName = "withBoof(" + (Comp.displayName || Comp.name) + ")";
	return Boof;
}

const Custom = withBoof(Foo);
const Multiple = withBoof(MemoLast);

render(
	html`
		<div><b>MemoFoo</b></div>
		<${MemoFoo} />
		<div><b>ForwardRef</b></div>
		<${Forward} />
		<div><b>ForwardRef (Anonymous)</b></div>
		<${ForwardAnonym} />
		<div><b>Custom HOC</b></div>
		<${Custom} />
		<div><b>Multple HOCs</b></div>
		<${Multiple} />
	`,
	document.getElementById("app"),
);
