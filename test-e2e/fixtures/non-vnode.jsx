import { h, render } from "preact";
import "preact/devtools";

const Child = () => null;

function App() {
	return <div>Element</div>;
}

render(
	h(App, {
		blob: new Blob(),
		obj: { type: "foo", props: null },
		vnode: h("div", { class: "bar" }),
		vnode2: h(Child, null),
	}),
	document.getElementById("app"),
);
