/* eslint-disable react/jsx-key */
import { Fragment, h, render } from "preact";

const css = "background: peachpuff; padding: 2rem; margin-bottom: 1rem;";

function ComponentArray() {
	return [
		<div style={css}>A</div>,
		<div style={css}>B</div>,
		<div style={css}>C</div>,
	];
}

function ComponentFrag() {
	return (
		<Fragment>
			<div style={css}>D</div>
			<div style={css}>E</div>
			<div style={css}>F</div>
		</Fragment>
	);
}

render(
	<div style="padding: 1rem">
		<div data-testid="test1">
			<ComponentArray />
		</div>
		<hr style="margin: 4rem 0" />
		<div data-testid="test2">
			<ComponentFrag />
		</div>
	</div>,
	document.getElementById("app"),
);
