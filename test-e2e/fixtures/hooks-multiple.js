const { render, createContext } = preact;
const { useState, useCallback, useContext, useMemo } = preactHooks;

function App() {
	const [s1, set_s1] = useState(1);
	const [s2, set_s2] = useState(2);
	const [s3, set_s3] = useState(3);
	const update_s3 = useCallback(() => {
		set_s3(s3 + 1);
	}, [s3, set_s3]);
	const test = useMemo(() => s1 + s2 + s3, [s1, s2, s3]);

	return html`<div className="page">
		<div className="content">
			${s1}, ${s2}, ${s3}
			<div>
				<button onClick=${() => set_s1(s1 + 1)}>S1++</button>
				<button onClick=${() => set_s2(s2 + 1)}>S2++</button>
				<button onClick=${update_s3}>S3++</button>
			</div>
			<div>${test}</div>
		</div>
	</div>`;
}

render(html`<${App} />`, document.getElementById("app"));
