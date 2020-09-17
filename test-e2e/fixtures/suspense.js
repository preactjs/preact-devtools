const { h, render } = preact;
const { Suspense } = preactCompat;
const { useMemo } = preactHooks;

function withDelay(ms) {
	useMemo(() => {
		let done = false;
		const promise = new Promise(resolve => setTimeout(resolve, ms)).then(() => {
			done = true;
		});
		return () => {
			if (!done) {
				throw promise;
			}
		};
	}, [])();
}

function Block(props) {
	const style = "padding: 2rem; background: " + props.background + ";";
	return html`
		<div data-testid=${props.id} style=${style}>${props.children}<//>
	`;
}

function Delayed(props) {
	withDelay(props.waitMs);
	return html` <${Block} id="delayed" background="cadetblue" /> `;
}

function Shortly() {
	const fallback = html` <${Block} id="skeleton" background="grey" /> `;
	return html`
		<${Block} id="container" background="black">
			<${Suspense} fallback=${fallback}>
				<${Delayed} waitMs=${500} />
			<//>
		<//>
	`;
}

render(h(Shortly), document.getElementById("app"));
