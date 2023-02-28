import { h, Fragment, render } from "preact";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function NestedObjProps(props) {
	return <div style="padding: 2rem;">Nested props</div>;
}

render(
	<Fragment>
		<NestedObjProps {...{ c: 3, a: 1, b: { c: 3, a: 1, b: 2 } }} />
	</Fragment>,
	document.getElementById("app"),
);
