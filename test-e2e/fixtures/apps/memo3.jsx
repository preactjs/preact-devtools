import { h, render } from "preact";
import { useState } from "preact/hooks";
import { memo } from "preact/compat";

export const Result = ({ result }) => {
	console.log("Result did render");
	return (
		<div class="result">
			<Nested text={result} />
		</div>
	);
};

const Nested = ({ text }) => {
	return <p>{text}</p>;
};

export const MemoResult = memo(Result, () => true);

const generateFakeData = () => {
	const rand = () => Math.random() * 10;
	return new Array(3).fill(rand());
};

function App() {
	const [results, setResults] = useState(generateFakeData());

	return (
		<div>
			<h1>Example</h1>
			<button onClick={() => setResults(generateFakeData())}>Refresh</button>
			<div class="list">
				<h2>No memo</h2>
				{results.map((result, i) => (
					<Result key={i} result={result} />
				))}
			</div>
			<div class="list">
				<h2>Memo</h2>
				{results.map((result, i) => (
					<MemoResult key={i} result={result} />
				))}
			</div>
		</div>
	);
}

render(<App />, document.getElementById("app"));
