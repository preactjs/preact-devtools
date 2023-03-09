import { h, render, createContext } from "preact";
import { useContext, useMemo, useState } from "preact/hooks";

// eslint-disable-next-line @typescript-eslint/no-empty-function
const Ctx = createContext({ value: 0, update: () => {} });

function Child() {
	const ctx = useContext(Ctx);
	return (
		<div>
			<p>{ctx.value}</p>
			<button onClick={ctx.update}>update</button>
		</div>
	);
}

function Blocker() {
	return useMemo(() => <Child />, []);
}

function App() {
	const [v, set] = useState(0);
	return (
		<Ctx.Provider value={{ value: v, update: () => set(v => v + 1) }}>
			<Blocker />
		</Ctx.Provider>
	);
}

render(<App />, document.getElementById("app"));
