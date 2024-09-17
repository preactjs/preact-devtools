import { h, render } from "preact";

function App(props) {
	return (
		<div>
			<p>
				set: <pre id="json-set">
					{JSON.stringify(Array.from(props.set.values()), null, 2)}
				</pre>
			</p>
			<p>
				map: <pre id="json-map">
					{JSON.stringify(Array.from(props.map.entries()), null, 2)}
				</pre>
			</p>
		</div>
	);
}

render(
	<App set={new Set([{ foo: 123 }])} map={new Map([[{ foo: 123 }, 123]])} />,
	document.getElementById("app"),
);
