import { createContext, h, render } from "preact";

const Ctx = createContext(null);
Ctx.displayName = "Foobar";

function App() {
	return (
		<Ctx.Provider value="foobar">
			<Ctx.Consumer>{(v) => `value: ${v}`}</Ctx.Consumer>
		</Ctx.Provider>
	);
}

render(<App />, document.getElementById("app"));
