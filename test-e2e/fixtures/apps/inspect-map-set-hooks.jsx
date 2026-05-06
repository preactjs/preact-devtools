import { h, render } from "preact";
import { useMemo, useState } from "preact/hooks";

function MapView() {
	const v1 = useMemo(() => new Map(), []);
	const v2 = useMemo(() => new Map([[1, 2]]), []);
	const [v3] = useState(new Map([[1, 2]]));

	return (
		<>
			<h1>Map</h1>
			<p>V1: {JSON.stringify(Array.from(v1.entries()))}</p>
			<p>V2: {JSON.stringify(Array.from(v2.entries()))}</p>
			<p>V3: {JSON.stringify(Array.from(v3.entries()))}</p>
		</>
	);
}

function SetView() {
	const v1 = useMemo(() => new Set(), []);
	const v2 = useMemo(() => new Set([1, 2]), []);
	const [v3] = useState(new Set([1, 2]));

	return (
		<>
			<h1>Set</h1>
			<p>V1: {JSON.stringify(Array.from(v1.values()))}</p>
			<p>V2: {JSON.stringify(Array.from(v2.values()))}</p>
			<p>V3: {JSON.stringify(Array.from(v3.values()))}</p>
		</>
	);
}

function App() {
	return (
		<>
			<MapView />
			<SetView />
		</>
	);
}

render(<App />, document.getElementById("app"));
