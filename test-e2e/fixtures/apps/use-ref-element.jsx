import { h, render } from "preact";
import { useRef } from "preact/hooks";

function App() {
	const inputRef = useRef();

	return (
		<div>
			<h1>check ref</h1>
			<input ref={inputRef} />
		</div>
	);
}

render(<App />, document.getElementById("app"));
