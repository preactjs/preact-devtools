import { h, render, createContext } from "preact";
import "preact/debug";

const Ctx = createContext(null);
Ctx.displayName = "Foobar";

function App() {
	return (
		<Ctx.Provider value="foobar">
			<Ctx.Consumer>{v => `value: ${v}`}</Ctx.Consumer>
		</Ctx.Provider>
	);
}

render(h(App), document.getElementById("app"));
