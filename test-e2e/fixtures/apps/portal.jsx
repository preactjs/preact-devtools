import { createPortal, h, render } from "preact";

function Modal() {
	return <section data-testid="portal-content">Portal content</section>;
}

function App() {
	return (
		<main>
			<h1>App content</h1>
			{createPortal(<Modal />, document.getElementById("portal-root"))}
		</main>
	);
}

const portalRoot = document.createElement("div");
portalRoot.id = "portal-root";
document.body.appendChild(portalRoot);

render(<App />, document.getElementById("app"));
