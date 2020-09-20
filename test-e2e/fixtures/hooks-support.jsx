import { h, render } from "preact@10.3.4";
import { useRef } from "preact@10.3.4/hooks";
import "preact@10.3.4/devtools";

function RefComponent() {
	const v = useRef(0);
	return <p>Ref: {v.current}</p>;
}

render(<RefComponent />, document.getElementById("app"));
