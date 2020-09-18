const { render, Component } = preact;
const { memo, forwardRef } = preactCompat;

function Foo() {
	return html`<div>I am foo</div>`;
}
const MemoFoo = memo(Foo);

function Wrapped(props) {
	return html`<div>${props.children}</div>`;
}

const Forward = forwardRef(function Bar(props, ref) {
	return html`<div ...${props} ref=${ref}>
		forward
	</div>`;
});

function withBoof(Comp) {
	class Boof extends Component {
		render() {
			return html`<div>
				<button
					onClick=${() => this.setState(p => ({ condition: !p.condition }))}
				>
					Update
				</button>
				<${Comp} ...${this.props}
					>${this.state.condition
						? html`<${MemoFoo} />`
						: html`<${Forward} />`}<//
				>
			</div>`;
		}
	}
	Boof.displayName = "withBoof(" + (Comp.displayName || Comp.name) + ")";
	return Boof;
}

const Custom = withBoof(Wrapped);

render(
	html`
		<div><b>Custom HOC</b></div>
		<${Custom} />
	`,
	document.getElementById("app"),
);
