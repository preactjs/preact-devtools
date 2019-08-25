import "./global.css";
import { h, render } from "preact";
import { DevTools } from "./Devtools";
import { init } from "./adapter/setup";
// @ts-ignore
import { renderExample } from "./examples/preact-10";
// @ts-ignore
import { options } from "./examples/preact.module.js";

init(options as any, (window as any).__PREACT_DEVTOOLS__);

const root1 = document.createElement("div");
const root2 = document.createElement("div");
root1.id = "root1";
root1.id = "root2";
document.body.appendChild(root1);
document.body.appendChild(root2);

renderExample(root1);
render(
	<div style="height: 100%">
		<DevTools></DevTools>
	</div>,
	root2,
);
