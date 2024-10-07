import { h, render } from "preact";

function createRootFragment(parent, replaceNode) {
	replaceNode = [].concat(replaceNode);
	const s = replaceNode[replaceNode.length - 1].nextSibling;
	function insert(c, r) {
		parent.insertBefore(c, r || s);
	}
	// @ts-ignore this is fine
	return (parent.__k = {
		nodeType: 1,
		parentNode: parent,
		firstChild: replaceNode[0],
		childNodes: replaceNode,
		insertBefore: insert,
		appendChild: insert,
		removeChild: function (c) {
			parent.removeChild(c);
		},
		contains: function (c) {
			return parent.contains(c);
		},
	});
}

const app = document.getElementById("app");
const app2 = document.createElement("div");
app2.id = "app-2";
app.parentNode.append(app2);

const app3 = document.createElement("div");
app3.id = "app-3";
app.parentNode.append(app3);
app3.id = "virtual-1";
app.parentNode.append(app3);

const App1 = () => <h1>App1</h1>;
const App2 = () => <h1>App2</h1>;
const App3 = () => <h1>App3</h1>;
const Virtual1 = () => <h1>Virtual1</h1>;
const Virtual2 = () => <h1>Virtual2</h1>;

render(<App2 />, app2);
render(<Virtual1 />, createRootFragment(app2, app2.children[0]));

render(<Virtual2 />, createRootFragment(app2, app2.children[0]));
render(<App3 />, app3);
render(<App1 />, app);
