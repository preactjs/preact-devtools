const { render } = preact;
const { useState } = preactHooks;

const useFoo = () =>
	useState({
		key1: {
			key2: {
				key3: {
					key4: {
						key5: {
							key6: {
								key7: {
									key8: {
										key9: 123,
									},
								},
							},
						},
					},
				},
			},
		},
	});
const useBar = () => useFoo();
const useBob = () => useBar();
const useBoof = () => useBob();
const useBlub = () => useBoof();
const useBread = () => useBlub();
const useBubby = () => useBread();
const useBabby = () => useBubby();
const useBleb = () => useBabby();
const useBlaBla = () => useBleb();
const useBrobba = () => useBlaBla();

function Hook() {
	const [v] = useBrobba();
	return html`<p>${JSON.stringify(v)}</p>`;
}

render(html`<${Hook} />`, document.getElementById("app"));
