import { h, render } from "./preact.module";
import { useState } from "./hooks.module";

export function TodoList() {
	const [todos, setTodos] = useState([]);
	const [v, setV] = useState("");
	return (
		<div style="padding: 5rem">
			<form
				onSubmit={e => {
					e.preventDefault();
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
			<ul>
				{todos.map(x => {
					return <li key={x}>{x}</li>;
				})}
			</ul>
		</div>
	);
}

export function renderExample(dom) {
	render(<TodoList />, dom);
}
