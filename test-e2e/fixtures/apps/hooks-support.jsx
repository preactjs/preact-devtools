import { h, render } from "preact";
import { useRef } from "preact/hooks";

function RefComponent() {
	const v = useRef(0);
	return <p>Ref: {v.current}</p>;
}

render(<RefComponent />, document.getElementById("app"));
