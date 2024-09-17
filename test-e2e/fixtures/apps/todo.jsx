import { h, render } from "preact";
import { useState } from "preact/hooks";

function TodoItem(props) {
	return (
		<li style="padding: 0.5rem 1rem;">
			<span>{props.children} -</span>
			<button onClick={props.onClick}>delete</button>
		</li>
	);
}
function Counter() {
	const [v, set] = useState(0);

	return (
		<div style="padding: 2rem;">
			<p>counter: {v}</p>
			<button type="button" onClick={() => set(v + 1)}>
				Increment
			</button>
		</div>
	);
}

function TodoList() {
	const [todos, setTodos] = useState(["foo", "bar"]);
	const [value, setValue] = useState("");

	return (
		<form
			style="padding: 2rem;"
			onSubmit={(e) => {
				e.preventDefault();
				if (value) {
					setTodos([...todos, value]);
					setValue("");
				}
			}}
		>
			<input
				type="text"
				value={value}
				onChange={(e) => setValue(e.target.value)}
			/>
			<button type="submit">submit</button>
			<ul>
				{todos.map((item, i) => (
					<TodoItem
						key={item}
						onClick={() => {
							const next = todos.slice();
							next.splice(i, 1);
							setTodos(next);
						}}
					>
						{item}
					</TodoItem>
				))}
			</ul>
			<Counter />
		</form>
	);
}

render(<TodoList />, document.getElementById("app"));
