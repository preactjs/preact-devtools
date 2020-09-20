import { h, Fragment, render, createContext } from "preact";
import { useMemo, useContext } from "preact/hooks";
import "preact/devtools";

function Memo() {
	const v = useMemo(() => {
		return {
			bar: {
				boof: {
					baz: 123,
				},
				foo: 123,
				bob: 123,
			},
		};
	}, []);

	return <p>{JSON.stringify(v)}</p>;
}

const Ctx = createContext({ foo: 123, bar: 123 });

function Context() {
	useContext(Ctx);
	return <p>Context</p>;
}

render(
	<>
		<Memo />
		<Ctx.Provider value={{ foo: 123, bar: 123 }}>
			<Context />
		</Ctx.Provider>
	</>,
	document.getElementById("app"),
);
