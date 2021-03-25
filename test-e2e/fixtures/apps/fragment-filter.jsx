import { h, render, Fragment } from "preact";

const css = "background: peachpuff; padding: 2rem; margin-bottom: 1rem;";

function Foo() {
	return <div style={css}>A</div>;
}

render(
	<Fragment>
		<Foo />
	</Fragment>,
	document.getElementById("app"),
);
