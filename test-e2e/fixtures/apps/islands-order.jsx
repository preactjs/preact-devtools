import { h, render } from "preact";

const app = document.getElementById("app");
const app2 = document.createElement("div");
app2.id = "app-2";
app.parentNode.append(app2);

const app3 = document.createElement("div");
app3.id = "app-3";
app.parentNode.append(app3);

const App1 = () => <h1>App1</h1>;
const App2 = () => <h1>App2</h1>;
const App3 = () => <h1>App3</h1>;

render(<App2 />, app2);
render(<App3 />, app3);
render(<App1 />, app);
