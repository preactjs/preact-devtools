import { h, render } from "preact";
import { createPortal } from "preact/compat";

function Display() {
	return <div data-testid="result">Portal</div>;
}

function App() {
	return createPortal(<Display />, document.getElementById("app2"));
}

render(<App />, document.getElementById("app"));
