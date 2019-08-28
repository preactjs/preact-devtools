import { h, render } from "./preact.module";
import { useState } from "./hooks.module";
import { Highlighter } from "../view/components/Highlighter";

export function TodoList() {
	const [todos, setTodos] = useState([]);
	const [v, setV] = useState("");
	return (
		<div style="padding: 5rem">
			<form
				onSubmit={e => {
					e.preventDefault();
					setV("");
					setTodos([...todos, v]);
				}}
			>
				<input
					type="text"
					placeholder="todo item"
					onInput={e => setV(e.target.value)}
					value={v}
				/>
			</form>
			<p>Tasks</p>
			<ul>
				{todos.map(x => {
					return <li key={x}>{x}</li>;
				})}
			</ul>

			<h2>Styleguide</h2>
			<h3>Highlighter</h3>
			<Highlighter
				top={200}
				left={200}
				label={"FooBarBob"}
				height={200}
				width={200}
				padding={[12, 10, 20, 20]}
				margin={[16, 16, 16, 16]}
				border={[5, 5, 5, 5]}
			/>
		</div>
	);
}

export function renderExample(dom) {
	render(<TodoList />, dom);
}
