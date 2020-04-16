const { render } = preact;

const css = "background: peachpuff; padding: 2rem; margin-bottom: 1rem;";

function ComponentArray() {
	return [
		html`<div style=${css}>A</div>`,
		html`<div style=${css}>B</div>`,
		html`<div style=${css}>C</div>`,
	];
}

function ComponentFrag() {
	return html`
		<div style=${css}>D</div>
		<div style=${css}>E</div>
		<div style=${css}>F</div>
	`;
}

render(
	html`
		<div style="padding: 1rem">
			<div data-testid="test1">
				<${ComponentArray} />
			</div>
			<hr style="margin: 4rem 0" />
			<div data-testid="test2">
				<${ComponentFrag} />
			</div>
		</div>
	`,
	document.getElementById("app"),
);
