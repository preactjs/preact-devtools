import { h, render, createContext } from "preact";

const Ctx = createContext(null);
Ctx.displayName = "Foobar";

function Foo() {
	return <h1>Foo</h1>;
}

function Bar() {
	return <h1>Bar</h1>;
}

console.log(__PREACT_DEVTOOLS__);

function App() {
	return (
		<div>
			<Foo __source="/foo/bar" />
			<Bar __source="/foo/bar" />
			<a href="vscode:///Users/marvinhagemeister/dev/github/preact-devtools/src/shells/shared/panel/panel.ts">
				vscode
			</a>
		</div>
	);
}

render(<App />, document.getElementById("app"));
