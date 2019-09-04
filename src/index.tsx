import "./global.css";
import { h, render } from "preact";
import { DevTools } from "./view/components/Devtools";
import { init } from "./adapter/setup";
// @ts-ignore
import { renderExample } from "./examples/preact-10";
import { options } from "preact";

init(options as any, () => (window as any).__PREACT_DEVTOOLS__);

const root1 = document.createElement("div");
const root2 = document.createElement("div");
root1.id = "root1";
root1.id = "root2";
document.body.appendChild(root1);
document.body.appendChild(root2);

renderExample(root1);
