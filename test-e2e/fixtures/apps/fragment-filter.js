const { render, Fragment } = preact;

const css = "background: peachpuff; padding: 2rem; margin-bottom: 1rem;";

function Foo() {
	return html`<div style=${css}>A</div>`;
}

render(
	html`<${Fragment}>
		<${Foo} />
	<//>`,
	document.getElementById("app"),
);
