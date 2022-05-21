import { h, render } from "preact";
import { useDebugValue, useRef } from "preact/hooks";

const useFoo = () => {
	const foo = useRef({ foo: "bar" }).current;
	useDebugValue(foo);
	return foo;
};

function App() {
	useFoo();
	return <h1>App</h1>;
}

render(<App />, document.getElementById("app"));
