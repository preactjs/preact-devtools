import { h, render } from "preact";
import { App } from "./App/App";

const app = document.createElement("div");
app.id = "app";
document.body.appendChild(app);

render(<App />, app);
