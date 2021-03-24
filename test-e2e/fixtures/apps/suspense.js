const { h, render } = preact;
const { Suspense } = preactCompat;

let loading = true;

function withDelay(ms) {
	const promise = new Promise(resolve => setTimeout(resolve, ms)).then(() => {
		loading = false;
	});

	if (loading) {
		throw promise;
	}
}

function Block(props) {
	const style = "padding: 2rem; background: " + props.background + ";";
	return html`
		<div data-testid=${props.id} style=${style}>${props.children}<//>
	`;
}

function Delayed(props) {
	withDelay(props.waitMs);
	return html`<${Block} id="delayed" background="blueviolet" />`;
}

function Shortly() {
	const fallback = html`<${Block} id="skeleton" background="grey" />`;
	return html`
		<${Block} id="container" background="#ccc">
			<${Suspense} fallback=${fallback}>
				<${Delayed} waitMs=${500} />
			<//>
		<//>
	`;
}

render(h(Shortly), document.getElementById("app"));
