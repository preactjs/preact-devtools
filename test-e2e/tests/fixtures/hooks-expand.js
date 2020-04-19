const { render, createContext } = preact;
const { useMemo, useContext } = preactHooks;

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

	return html`<p>${JSON.stringify(v)}</p>`;
}

const Ctx = createContext({ foo: 123, bar: 123 });

function Context() {
	useContext(Ctx);
	return html`<p>Context</p>`;
}

render(
	html`
		<${Memo} />
		<${Ctx.Provider} value="${{ foo: 123, bar: 123 }}">
			<${Context} />
		<//>
	`,
	document.getElementById("app"),
);
