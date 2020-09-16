const { h, render, createContext } = preact;
const { useState } = preactHooks;

const Ctx = createContext(null);
Ctx.displayName = "Foobar";

function App() {
	return html`
		<${Ctx.Provider} value="foobar">
			<${Ctx.Consumer}>
				${v => `value: ${v}`}
			<//>
		<//>
	`;
}

render(h(App), document.getElementById("app"));
