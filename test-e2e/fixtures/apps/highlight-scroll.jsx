import { h, render } from "preact";

const css =
	"background: peachpuff; padding: 4rem; margin-bottom: 6rem; margin-right: 4rem";

function Item({ children }) {
	return (
		<div style={css} data-testid={children}>
			{children}
		</div>
	);
}

function App() {
	// eslint-disable-next-line no-new-array
	return new Array(100).fill(0).map((_, i) => <Item key={i}>{i}</Item>);
}

render(<App />, document.getElementById("app"));
