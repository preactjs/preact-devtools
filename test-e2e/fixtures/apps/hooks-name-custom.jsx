/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { h, render } from "preact";
import { useMemo } from "preact/hooks";
import { addHookName } from "preact/devtools";

function useFoo() {
	const a = addHookName(
		useMemo(() => "a", []),
		"a",
	);
	const b = addHookName(
		useMemo(() => "b", []),
		"b",
	);
	return a + b;
}

function App() {
	const v = useFoo();
	return <h1>{v}</h1>;
}

render(<App />, document.getElementById("app"));
