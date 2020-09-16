const { render } = preact;

const css =
	"background: peachpuff; padding: 4rem; margin-bottom: 6rem; margin-right: 4rem";

function Item({ children }) {
	return html`<div style=${css} data-testid="${children}">${children}</div>`;
}

function App() {
	return new Array(100).fill(0).map((_, i) => html`<${Item}>${i}<//>`);
}

render(html`<${App} />`, document.getElementById("app"));
