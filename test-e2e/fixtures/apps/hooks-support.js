const { render } = preact;
const { useRef } = preactHooks;

function RefComponent() {
	const v = useRef(0);
	return html`<p>Ref: ${v.current}</p>`;
}

render(html` <${RefComponent} /> `, document.getElementById("app"));
