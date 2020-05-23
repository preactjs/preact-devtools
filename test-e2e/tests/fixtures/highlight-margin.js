const { h, render } = preact;

function Headline() {
	return html`<h1 data-testid="headline">Heading H1</h1>`;
}

function MarginBox() {
	return html`<div
		data-testid="margin-box"
		style="margin: 2rem; outline: 3px solid red;"
	>
		Margin box
	</div>`;
}

function BorderBox() {
	return html`<div
		data-testid="border-box"
		style="margin: 2rem; border: 4px solid blue; outline: 3px solid red;"
	>
		border box
	</div>`;
}

function App() {
	return html`
		<div style="padding: 2rem;">
			<${Headline} />
			<${MarginBox} />
			<${BorderBox} />
		</div>
	`;
}

render(h(App), document.getElementById("app"));
