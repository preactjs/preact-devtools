import { h, render } from "preact";
import { Suspense } from "preact/compat";

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
	return (
		<div data-testid={props.id} style={style}>
			{props.children}
		</div>
	);
}

function Delayed(props) {
	withDelay(props.waitMs);
	return <Block id="delayed" background="blueviolet" />;
}

function Shortly() {
	const fallback = <Block id="skeleton" background="grey" />;
	return (
		<Block id="container" background="#ccc">
			<Suspense fallback={fallback}>
				<Delayed waitMs={500} />
			</Suspense>
		</Block>
	);
}

render(<Shortly />, document.getElementById("app"));
